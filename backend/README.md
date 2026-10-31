# Why Not Grill Me? — Backend

NestJS API for the interactive engineering portfolio.

Run from this folder (`backend/`). Frontend lives in `../frontend`.

## Current status

**Phase 0 + Phase 1 + Phase 2 + Phase 3**

- Health, config, throttling, Gemini multi-key pool
- Markdown knowledge loader + public read APIs
- **Meet Your Engineer** grounded SSE chat with sessions, evidence, highlights, and rabbit-hole suggestions
- **The Grill** project drill, session recap, contact + static resumes, honest JD analysis, GitHub README sync

## Quick start

```bash
cp .env.example .env
# set GEMINI_API_KEYS for chat
npm install
npm run start:dev
```

Health: http://localhost:3000/api/v1/health

```bash
npm test
npm run test:e2e
npm run knowledge:validate
```

## Read APIs (v1)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/profile` | Profile + experience |
| GET | `/api/v1/projects` | Public project list |
| GET | `/api/v1/projects/:id` | Project detail |
| GET | `/api/v1/projects/:id/architecture` | Architecture graph JSON |
| GET | `/api/v1/skills` | Skills index |
| GET | `/api/v1/skills/:id` | Skill + related projects |
| GET | `/api/v1/evidence` | Evidence list |
| GET | `/api/v1/evidence/:id` | Evidence detail |
| GET | `/api/v1/stories` | Stories list (`?tag=` optional) |
| GET | `/api/v1/stories/:id` | Story detail |
| GET | `/api/v1/entry` | Visitor role presets |
| GET | `/api/v1/entry/:role` | `hiring` \| `engineer` \| `exploring` |
| GET | `/api/v1/agent/modes` | Grill modes, audiences, actions |
| GET | `/api/v1/agent/suggestions` | Starter questions (no LLM) |

## Meet Your Engineer (SSE)

`POST /api/v1/agent/chat`

Body:

```json
{
  "message": "What did you build at Venwiz?",
  "conversationId": "optional-uuid",
  "grillMode": "warm_up | medium_rare | well_done",
  "depth": "hook | deep",
  "audience": "recruiter | junior | senior",
  "visitorRole": "hiring | engineer | exploring",
  "resumeVariant": "generic | backend | ai",
  "action": "go_deeper | explain_simply | what_could_go_wrong | challenge_this | show_receipts"
}
```

Progressive chain: default `depth=hook` (overview). Suggestion chips use `action.depth=deep` — send that back on click for the in-depth turn.

Response: `text/event-stream` with events:

| Event | Payload |
|---|---|
| `meta` | `conversationId`, `grillMode`, `audience`, `depth`, optional `projectId` / `action` |
| `token` | `{ text }` streaming deltas |
| `highlight` | `{ text, kind, projectId? }` short grounded callouts (`claim` \| `stack` \| `outcome` \| `tradeoff`) |
| `links` | related `projectIds` / `skillIds` / `storyIds` |
| `evidence` | validated `evidenceIds` only |
| `suggestions` | clickable threads (`ask` + `depth`, `open_*`, …) |
| `done` | `finishReason`: `stop` \| `error` \| `unavailable` |
| `error` | safe `{ message }` |

Chat / grill / JD routes use a stricter throttle (20 req / 60s per IP) than the global limit.

Answers are grounded in the Markdown knowledge index. Missing Gemini keys returns `unavailable` instead of inventing content.

## The Grill + session recap

`POST /api/v1/agent/grill`

```json
{
  "projectId": "workspace-insights-hawkai",
  "message": "optional — defaults to a project walkthrough",
  "conversationId": "optional-uuid",
  "grillMode": "medium_rare",
  "audience": "senior",
  "action": "challenge_this",
  "depth": "deep"
}
```

Same SSE event set as chat (including `highlight`), with project-pinned retrieval.

`GET /api/v1/agent/sessions/:conversationId/recap`

JSON takeaway: themes, mentioned projects/skills/evidence, accumulated highlights, actions used, suggested next chips. Grounded only — not a resume rewrite.

## Contact + resumes

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/contact` | Public links from profile (no phone) |
| POST | `/api/v1/contact/message` | Inbound message (throttled; optional disk log) |
| GET | `/api/v1/resumes` | List variants present under `knowledge/resume/` |
| GET | `/api/v1/resumes/:variant` | Serve file as-is (`generic` \| `backend` \| `ai`) |

Resumes are **not** generated. Markdown is served today; if a matching `.pdf` is added later, that file is preferred.

## Honest JD analysis

`POST /api/v1/agent/jd`

```json
{
  "jdText": "paste the job description…",
  "resumeVariant": "backend"
}
```

Returns matched skills/projects, evidence IDs, gaps, and a `doNotClaim` list. No LLM required — keyword match against the public knowledge base.

## GitHub README sync

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/github/syncable` | Projects with `readmeSync: true` + `repo` |
| POST | `/api/v1/github/sync` | `{ "projectId"? }` — fetch README → `{id}.readme.synced.md` + reindex |
| POST | `/api/v1/github/webhook` | Verifies `X-Hub-Signature-256`, syncs matching repos |

Set `GITHUB_WEBHOOK_SECRET` (required for webhook) and optional `GITHUB_TOKEN` for API rate limits / private repos.

## Stack

NestJS 12 (ESM) · Vitest · Gemini · file-based Markdown knowledge

## Knowledge

Curated Markdown under [`knowledge/`](knowledge/). See [`knowledge/AUTHORING.md`](knowledge/AUTHORING.md) and [`knowledge/README.md`](knowledge/README.md).
