# Why Not Grill Me?

Interactive AI-powered engineering portfolio API.

## Phase 0 (current)

- `GET /api/v1/health`
- Gemini multi-key pool (round-robin + cooldown failover)
- Global validation, CORS, and rate limiting
- Shared enums: `GrillMode`, `VisitorRole`, `ResumeVariant`, `Audience`, `GrillAction`
- Empty `knowledge/` tree for your Markdown

## Quick start

```bash
cp .env.example .env
npm install
npm run start:dev
```

Health: http://localhost:3000/api/v1/health

```bash
npm test
npm run test:e2e
```

## Stack

NestJS 12 (ESM) · Vitest · Gemini · file-based knowledge (no DB for content)

## Knowledge

See [`knowledge/AUTHORING.md`](knowledge/AUTHORING.md). You provide all curated Markdown.
