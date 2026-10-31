import { ValidationPipe, VersioningType } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { join } from 'node:path';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.ts';
import { GeminiService } from '../src/gemini/gemini.service.ts';
import { KnowledgeService } from '../src/knowledge/knowledge.service.ts';

describe('API (e2e)', () => {
  let app: Awaited<ReturnType<TestingModule['createNestApplication']>>;

  beforeEach(async () => {
    process.env.KNOWLEDGE_ROOT = join(process.cwd(), 'test/fixtures/knowledge');
    process.env.GITHUB_WEBHOOK_SECRET = 'e2e-secret';
    process.env.CONTACT_MESSAGE_DIR = '';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GeminiService)
      .useValue({
        isConfigured: () => true,
        streamGenerateText: async function* () {
          yield 'The Demo API is a NestJS sample. ';
          yield 'Evidence: demo-repo';
        },
        generateText: async () => 'ok',
      })
      .compile();

    app = moduleFixture.createNestApplication({ rawBody: true });
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    app.get(KnowledgeService).reindex(process.env.KNOWLEDGE_ROOT);
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/v1/health', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('GET /api/v1/profile', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/profile');
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Test Engineer');
  });

  it('GET /api/v1/agent/suggestions', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/agent/suggestions',
    );
    expect(response.status).toBe(200);
    expect(response.body.items.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/agent/chat streams SSE events including highlights', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/agent/chat')
      .set('Accept', 'text/event-stream')
      .send({ message: 'Tell me about the demo API' })
      .buffer(true)
      .parse((res, callback) => {
        const data: Buffer[] = [];
        res.on('data', (chunk) => data.push(Buffer.from(chunk)));
        res.on('end', () =>
          callback(null, Buffer.concat(data).toString('utf8')),
        );
      });

    expect(response.status).toBe(200);
    const body = String(response.body);
    expect(body).toContain('event: meta');
    expect(body).toContain('event: token');
    expect(body).toContain('event: highlight');
    expect(body).toContain('event: evidence');
    expect(body).toContain('event: suggestions');
    expect(body).toContain('event: done');
    expect(body).toContain('demo-repo');
  });

  it('POST /api/v1/agent/grill + GET session recap', async () => {
    const grill = await request(app.getHttpServer())
      .post('/api/v1/agent/grill')
      .set('Accept', 'text/event-stream')
      .send({ projectId: 'demo-api', action: 'show_receipts' })
      .buffer(true)
      .parse((res, callback) => {
        const data: Buffer[] = [];
        res.on('data', (chunk) => data.push(Buffer.from(chunk)));
        res.on('end', () =>
          callback(null, Buffer.concat(data).toString('utf8')),
        );
      });

    expect(grill.status).toBe(200);
    const body = String(grill.body);
    expect(body).toContain('event: meta');
    expect(body).toContain('demo-api');
    expect(body).toContain('event: highlight');

    const metaMatch = body.match(
      /event: meta\ndata: ({[^\n]+})\n/,
    );
    expect(metaMatch?.[1]).toBeTruthy();
    const meta = JSON.parse(metaMatch![1]) as { conversationId: string };

    const recap = await request(app.getHttpServer()).get(
      `/api/v1/agent/sessions/${meta.conversationId}/recap`,
    );
    expect(recap.status).toBe(200);
    expect(recap.body.conversationId).toBe(meta.conversationId);
    expect(recap.body.projectIds).toContain('demo-api');
    expect(recap.body.highlights.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/entry/hiring', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/entry/hiring',
    );
    expect(response.status).toBe(200);
    expect(response.body.role).toBe('hiring');
  });

  it('GET /api/v1/contact and POST message', async () => {
    const contact = await request(app.getHttpServer()).get('/api/v1/contact');
    expect(contact.status).toBe(200);
    expect(contact.body.links.email).toBe('test@example.com');

    const message = await request(app.getHttpServer())
      .post('/api/v1/contact/message')
      .send({
        name: 'Recruiter',
        email: 'recruiter@example.com',
        message: 'Loved the Demo API write-up — can we chat?',
      });
    expect([200, 201]).toContain(message.status);
    expect(message.body.ok).toBe(true);
  });

  it('GET /api/v1/resumes serves static markdown', async () => {
    const list = await request(app.getHttpServer()).get('/api/v1/resumes');
    expect(list.status).toBe(200);
    expect(list.body.items.length).toBeGreaterThan(0);

    const file = await request(app.getHttpServer()).get(
      '/api/v1/resumes/generic',
    );
    expect(file.status).toBe(200);
    expect(String(file.headers['content-type'])).toContain('markdown');
    expect(file.text).toContain('Test Engineer');
  });

  it('POST /api/v1/agent/jd returns grounded analysis', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/agent/jd')
      .send({
        jdText:
          'Looking for NestJS and TypeScript backend experience building APIs. Required: NestJS. Nice to have: obscure COBOL mainframes.',
      });
    expect([200, 201]).toContain(response.status);
    expect(
      response.body.matchedSkills.some((s: { id: string }) => s.id === 'nestjs'),
    ).toBe(true);
    expect(response.body.disclaimer).toMatch(/grounded/i);
  });

  it('POST /api/v1/github/webhook verifies signature', async () => {
    const payload = JSON.stringify({
      repository: { full_name: 'other/unrelated-repo' },
      ref: 'refs/heads/main',
    });
    const digest = createHmac('sha256', 'e2e-secret')
      .update(payload)
      .digest('hex');

    const response = await request(app.getHttpServer())
      .post('/api/v1/github/webhook')
      .set('Content-Type', 'application/json')
      .set('X-Hub-Signature-256', `sha256=${digest}`)
      .send(payload);

    expect([200, 201]).toContain(response.status);
    expect(response.body.ignored).toBe(true);
  });
});
