# Knowledge base authoring

You own all curated content under `knowledge/`. The API loads these files at boot (Phase 1+).

## Layout

```
knowledge/
  profile.md
  experience/
  projects/
    {project-id}.md
    {project-id}.architecture.json   # optional
    {project-id}.readme.synced.md    # auto from GitHub (do not hand-edit as source of truth)
  skills.md
  evidence/
  stories/
  resume/
    generic.pdf
    backend.pdf
    ai.pdf
```

## Rules

- Curated `{project-id}.md` is the source of truth for each project.
- Synced README files are supplemental evidence and may be overwritten by webhooks.
- Only mark content `visibility: public` when it is safe for visitors.
- Do not invent achievements in Markdown that you cannot support with evidence.

Phase 1 will document required frontmatter fields in detail.
