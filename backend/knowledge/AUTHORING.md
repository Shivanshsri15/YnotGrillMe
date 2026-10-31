# Knowledge base authoring

You own all curated content under `knowledge/`. The API loads these files at boot.

## Layout

```
knowledge/
  profile.md
  skills.md
  experience/
    {id}.md
  projects/
    {project-id}.md
    {project-id}.architecture.json   # optional
    {project-id}.readme.synced.md    # auto from GitHub webhook/sync
  evidence/
    {id}.md
  stories/
    {id}.md
  resume/                            # served as-is (prefer .pdf if present, else .md)
```

Only `visibility: public` content is returned by public APIs. Default visibility is `public`.

## Frontmatter contracts

### `profile.md`

```yaml
---
name: Your Name
headline: Backend / AI Engineer
summary: One-line pitch
visibility: public
contactEnabled: true
schedulingUrl: https://cal.com/you
links:
  github: https://github.com/you
  linkedin: https://linkedin.com/in/you
  website: https://you.dev
  email: you@example.com
---

Longer profile body in Markdown.
```

### `experience/{id}.md`

```yaml
---
id: acme-backend
company: Acme
role: Software Engineer
dates: 2022 — Present
skillIds: [nestjs, typescript]
visibility: public
summary: Short blurb
---

Role details, responsibilities, impact.
```

### `projects/{project-id}.md`

```yaml
---
id: my-project
title: My Project
summary: What it does
stack: [NestJS, TypeScript, MongoDB]
repo: you/my-project
defaultBranch: main
readmeSync: true
skillIds: [nestjs]
evidenceIds: [my-project-repo]
pillar: ai # or backend | platform
narrativeOrder: 1 # lower = earlier (AI → backend → platform)
visibility: public
---

## Problem
...

## Architecture
...

## Trade-offs
...
```

Optional architecture sidecar `{project-id}.architecture.json`:

```json
{
  "nodes": [{ "id": "api", "label": "API", "description": "NestJS API" }],
  "edges": [{ "id": "e1", "source": "api", "target": "db" }],
  "flows": [{ "id": "f1", "label": "Create review", "steps": ["api", "db"] }]
}
```

### `skills.md`

```yaml
---
skills:
  - id: nestjs
    name: NestJS
    level: production   # production | project | learning
    summary: Built modular Nest APIs
    projectIds: [my-project]
    evidenceIds: [my-project-repo]
---
```

### `evidence/{id}.md`

```yaml
---
id: my-project-repo
title: My Project GitHub
type: github-repo
url: https://github.com/you/my-project
supports: Public repository for My Project
projectIds: [my-project]
skillIds: [nestjs]
visibility: public
---
```

### `stories/{id}.md`

```yaml
---
id: nasty-race-condition
title: The race condition that only happened on Fridays
summary: Debugging a subtle concurrency bug
tags: [debugging, concurrency]
projectIds: [my-project]
skillIds: [nestjs]
visibility: public
---

Story body.
```

## Rules

- Curated `{project-id}.md` is the source of truth.
- Synced README files are supplemental and may be overwritten by webhooks later.
- Do not invent achievements you cannot support with evidence.
- Missing files are fine — APIs return empty lists or 404 until you add content.
