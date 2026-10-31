import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { KnowledgeService } from '../knowledge/knowledge.service.ts';
import type { ProjectRecord } from '../knowledge/interfaces/knowledge.interfaces.ts';

export interface SyncResult {
  projectId: string;
  repo: string;
  ok: boolean;
  bytes?: number;
  error?: string;
}

@Injectable()
export class GithubSyncService {
  private readonly logger = new Logger(GithubSyncService.name);

  constructor(
    private readonly knowledge: KnowledgeService,
    private readonly config: ConfigService,
  ) {}

  verifyWebhookSignature(rawBody: Buffer, signatureHeader?: string): void {
    const secret = this.config.get<string>('github.webhookSecret') ?? '';
    if (!secret) {
      throw new UnauthorizedException('GitHub webhook secret is not configured');
    }
    if (!signatureHeader?.startsWith('sha256=')) {
      throw new UnauthorizedException('Missing GitHub signature');
    }
    const digest = createHmac('sha256', secret).update(rawBody).digest('hex');
    const expected = Buffer.from(`sha256=${digest}`, 'utf8');
    const provided = Buffer.from(signatureHeader, 'utf8');
    if (
      expected.length !== provided.length ||
      !timingSafeEqual(expected, provided)
    ) {
      throw new UnauthorizedException('Invalid GitHub signature');
    }
  }

  async handleWebhookPayload(payload: unknown): Promise<{
    synced: SyncResult[];
    ignored: boolean;
  }> {
    const event = payload as {
      repository?: { full_name?: string };
      ref?: string;
    };
    const fullName = event.repository?.full_name?.toLowerCase();
    if (!fullName) {
      return { synced: [], ignored: true };
    }

    const projects = this.syncableProjects().filter(
      (project) => project.repo?.toLowerCase() === fullName,
    );
    if (!projects.length) {
      return { synced: [], ignored: true };
    }

    const synced: SyncResult[] = [];
    for (const project of projects) {
      synced.push(await this.syncProject(project.id));
    }
    return { synced, ignored: false };
  }

  async syncProject(projectId: string): Promise<SyncResult> {
    const project = this.knowledge
      .getPublicProjects()
      .find((item) => item.id === projectId);
    if (!project) {
      throw new NotFoundException(`Project "${projectId}" not found`);
    }
    if (!project.readmeSync) {
      throw new BadRequestException(
        `Project "${projectId}" does not enable readmeSync`,
      );
    }
    if (!project.repo) {
      throw new BadRequestException(`Project "${projectId}" has no repo`);
    }

    try {
      const markdown = await this.fetchReadme(project.repo, project.defaultBranch);
      const path = join(
        this.knowledge.getRootPath(),
        'projects',
        `${project.id}.readme.synced.md`,
      );
      writeFileSync(path, markdown, 'utf8');
      this.knowledge.reindex();
      return {
        projectId: project.id,
        repo: project.repo,
        ok: true,
        bytes: Buffer.byteLength(markdown, 'utf8'),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`README sync failed for ${project.id}: ${message}`);
      return {
        projectId: project.id,
        repo: project.repo,
        ok: false,
        error: message,
      };
    }
  }

  async syncAll(): Promise<SyncResult[]> {
    const results: SyncResult[] = [];
    for (const project of this.syncableProjects()) {
      results.push(await this.syncProject(project.id));
    }
    return results;
  }

  listSyncable(): Array<{ projectId: string; repo: string; defaultBranch: string }> {
    return this.syncableProjects().map((project) => ({
      projectId: project.id,
      repo: project.repo!,
      defaultBranch: project.defaultBranch,
    }));
  }

  private syncableProjects(): ProjectRecord[] {
    return this.knowledge
      .getPublicProjects()
      .filter((project) => project.readmeSync && Boolean(project.repo));
  }

  private async fetchReadme(repo: string, branch: string): Promise<string> {
    const token = this.config.get<string>('github.token') ?? '';
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.raw',
      'User-Agent': 'ynot-grill-me-readme-sync',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = `https://api.github.com/repos/${repo}/readme?ref=${encodeURIComponent(branch)}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(
        `GitHub README fetch failed (${response.status}) for ${repo}@${branch}`,
      );
    }
    const text = await response.text();
    if (!text.trim()) {
      throw new Error(`Empty README for ${repo}`);
    }
    return text;
  }
}
