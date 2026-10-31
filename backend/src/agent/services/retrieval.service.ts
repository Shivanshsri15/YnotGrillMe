import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import matter from 'gray-matter';
import { KnowledgeService } from '../../knowledge/knowledge.service.ts';
import {
  Audience,
  ExperiencePillar,
  GrillAction,
  GrillMode,
  ResumeVariant,
  VisitorRole,
} from '../../shared/enums.ts';
import {
  AGENT_MAX_CONTEXT_CHARS,
  AGENT_STOP_WORDS,
  AGENT_TOP_CHUNKS,
} from '../constants/agent.constants.ts';
import type {
  RetrievalChunk,
  RetrievalOptions,
  RetrievalResult,
} from '../interfaces/agent.interfaces.ts';
import type { ProjectRecord } from '../../knowledge/interfaces/knowledge.interfaces.ts';

@Injectable()
export class RetrievalService {
  constructor(private readonly knowledge: KnowledgeService) {}

  retrieve(options: RetrievalOptions): RetrievalResult {
    const tokens = this.tokenize(options.query);
    const scored: RetrievalChunk[] = [];
    const pinnedProject = options.projectId
      ? this.knowledge
          .getPublicProjects()
          .find((project) => project.id === options.projectId)
      : undefined;

    const profile = this.knowledge.getProfile();
    if (profile && !pinnedProject) {
      const text = this.truncate(
        `${profile.headline}\n${profile.summary}\n${profile.body}`,
        this.bodyLimit(options.grillMode, true),
      );
      scored.push({
        id: 'profile',
        sourceType: 'profile',
        title: profile.name,
        text,
        score:
          this.scoreText(`${profile.name} ${profile.headline} ${profile.summary} ${profile.body}`, tokens) +
          this.roleBias(options, 'profile'),
      });
    }

    const broadExperience =
      !pinnedProject && this.isBroadExperienceQuery(options.query, tokens);

    for (const exp of this.knowledge.getExperience()) {
      const haystack = `${exp.company} ${exp.role} ${exp.summary} ${exp.body} ${exp.skillIds.join(' ')}`;
      // Broad experience questions need the full progressive narrative, not a stub.
      const expLimit = broadExperience
        ? 9000
        : this.bodyLimit(options.grillMode, false);
      scored.push({
        id: exp.id,
        sourceType: 'experience',
        title: `${exp.role} @ ${exp.company}`,
        text: this.truncate(`${exp.summary}\n${exp.body}`, expLimit),
        score:
          this.scoreText(haystack, tokens) +
          this.roleBias(options, 'experience') +
          (broadExperience ? 8 : 0),
      });
    }

    for (const project of this.knowledge.getPublicProjects()) {
      const haystack = `${project.title} ${project.summary} ${project.stack.join(' ')} ${project.skillIds.join(' ')} ${project.pillar ?? ''} ${project.body}`;
      const pinnedBoost =
        pinnedProject && project.id === pinnedProject.id ? 100 : 0;
      const skipUnrelatedPin =
        pinnedProject && project.id !== pinnedProject.id ? -50 : 0;
      scored.push({
        id: project.id,
        sourceType: 'project',
        title: project.title,
        text: this.truncate(
          `${project.summary}\nPillar: ${project.pillar ?? 'unset'}\nStack: ${project.stack.join(', ')}\n${project.body}`,
          this.bodyLimit(options.grillMode, false),
        ),
        score:
          this.scoreText(haystack, tokens) +
          this.roleBias(options, 'project') +
          this.narrativeBoost(project, broadExperience) +
          this.actionBias(options.action, 'project') +
          (options.grillMode === GrillMode.WellDone ? 1 : 0) +
          pinnedBoost +
          skipUnrelatedPin,
      });
    }

    for (const skill of this.knowledge.getSkills()) {
      const linkedToPin =
        pinnedProject && pinnedProject.skillIds.includes(skill.id);
      if (pinnedProject && !linkedToPin) {
        continue;
      }
      const haystack = `${skill.name} ${skill.summary ?? ''} ${skill.id} ${skill.level}`;
      scored.push({
        id: skill.id,
        sourceType: 'skill',
        title: skill.name,
        text: `${skill.name} (${skill.level})${skill.summary ? `: ${skill.summary}` : ''}`,
        score:
          this.scoreText(haystack, tokens) +
          0.5 +
          (linkedToPin ? 20 : 0) +
          this.actionBias(options.action, 'skill'),
      });
    }

    for (const story of this.knowledge.getPublicStories()) {
      // Catch-all narrative dumps bloat the prompt and dominate keyword hits.
      if (story.id === 'interview-narratives') {
        continue;
      }
      const linkedToPin =
        pinnedProject && story.projectIds.includes(pinnedProject.id);
      if (pinnedProject && !linkedToPin) {
        continue;
      }
      const haystack = `${story.title} ${story.summary} ${story.tags.join(' ')} ${story.body}`;
      scored.push({
        id: story.id,
        sourceType: 'story',
        title: story.title,
        text: this.truncate(
          `${story.summary}\n${story.body}`,
          this.bodyLimit(options.grillMode, false),
        ),
        score:
          this.scoreText(haystack, tokens) +
          (linkedToPin ? 25 : 0) +
          this.actionBias(options.action, 'story'),
      });
    }

    for (const evidence of this.knowledge.listEvidence()) {
      const linkedToPin =
        pinnedProject &&
        (pinnedProject.evidenceIds.includes(evidence.id) ||
          evidence.projectIds.includes(pinnedProject.id));
      if (pinnedProject && !linkedToPin) {
        continue;
      }
      const haystack = `${evidence.title} ${evidence.supports} ${evidence.type} ${evidence.body}`;
      scored.push({
        id: evidence.id,
        sourceType: 'evidence',
        title: evidence.title,
        text: this.truncate(
          `${evidence.supports}\n${evidence.url ?? ''}\n${evidence.body}`,
          1200,
        ),
        score:
          this.scoreText(haystack, tokens) +
          (linkedToPin ? 30 : 0) +
          this.actionBias(options.action, 'evidence'),
      });
    }

    if (options.resumeVariant) {
      const resumeChunk = this.loadResumeChunk(options.resumeVariant);
      if (resumeChunk) {
        scored.push({
          ...resumeChunk,
          score:
            this.scoreText(resumeChunk.text, tokens) +
            (options.visitorRole === VisitorRole.Hiring ? 2 : 1),
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);

    // Always include a bit of profile/experience for hiring-friendly chats
    const selected: RetrievalChunk[] = [];
    const seen = new Set<string>();

    if (pinnedProject) {
      const pinHit =
        scored.find(
          (chunk) =>
            chunk.sourceType === 'project' && chunk.id === pinnedProject.id,
        ) ?? null;
      if (pinHit) {
        selected.push(pinHit);
        seen.add(`project:${pinHit.id}`);
      }
    }

    const ensureTypes: Array<RetrievalChunk['sourceType']> = [];
    if (!pinnedProject) {
      ensureTypes.push('profile');
      if (
        broadExperience ||
        options.visitorRole === VisitorRole.Hiring ||
        options.audience === Audience.Recruiter
      ) {
        ensureTypes.push('experience');
      }
    }

    for (const type of ensureTypes) {
      const hit = scored.find((chunk) => chunk.sourceType === type);
      if (hit && !seen.has(`${hit.sourceType}:${hit.id}`)) {
        selected.push(hit);
        seen.add(`${hit.sourceType}:${hit.id}`);
      }
    }

    // Broad "what did you build" questions need one project per narrative lane.
    if (broadExperience) {
      for (const pillar of [
        ExperiencePillar.Ai,
        ExperiencePillar.Backend,
        ExperiencePillar.Platform,
      ]) {
        const project = this.knowledge
          .getPublicProjects()
          .find((item) => item.pillar === pillar);
        if (!project) continue;
        const key = `project:${project.id}`;
        if (seen.has(key)) continue;
        const hit =
          scored.find(
            (chunk) =>
              chunk.sourceType === 'project' && chunk.id === project.id,
          ) ?? null;
        if (hit) {
          selected.push(hit);
          seen.add(key);
        }
      }
    }

    for (const chunk of scored) {
      if (selected.length >= AGENT_TOP_CHUNKS) break;
      if (chunk.score <= 0 && selected.length >= 3) continue;
      const key = `${chunk.sourceType}:${chunk.id}`;
      if (seen.has(key)) continue;
      selected.push(chunk);
      seen.add(key);
    }

    let totalChars = 0;
    const capped: RetrievalChunk[] = [];
    for (const chunk of selected) {
      if (totalChars >= AGENT_MAX_CONTEXT_CHARS) break;
      const remaining = AGENT_MAX_CONTEXT_CHARS - totalChars;
      const text =
        chunk.text.length > remaining
          ? chunk.text.slice(0, remaining)
          : chunk.text;
      capped.push({ ...chunk, text });
      totalChars += text.length;
    }

    const projectIds = capped
      .filter((c) => c.sourceType === 'project')
      .map((c) => c.id)
      .sort((a, b) => {
        const ap =
          this.knowledge.getPublicProjects().find((p) => p.id === a)
            ?.narrativeOrder ?? Number.MAX_SAFE_INTEGER;
        const bp =
          this.knowledge.getPublicProjects().find((p) => p.id === b)
            ?.narrativeOrder ?? Number.MAX_SAFE_INTEGER;
        return ap - bp;
      });
    const skillIds = capped
      .filter((c) => c.sourceType === 'skill')
      .map((c) => c.id);
    const storyIds = capped
      .filter((c) => c.sourceType === 'story')
      .map((c) => c.id);

    const evidenceIds = [
      ...new Set([
        ...capped.filter((c) => c.sourceType === 'evidence').map((c) => c.id),
        ...this.knowledge
          .getPublicProjects()
          .filter((p) => projectIds.includes(p.id))
          .flatMap((p) => p.evidenceIds),
        ...this.knowledge
          .getSkills()
          .filter((s) => skillIds.includes(s.id))
          .flatMap((s) => s.evidenceIds),
      ]),
    ].filter((id) => this.knowledge.getPublicEvidenceIds().has(id));

    return {
      chunks: capped,
      projectIds,
      skillIds,
      storyIds,
      evidenceIds,
    };
  }

  private loadResumeChunk(
    variant: ResumeVariant,
  ): Omit<RetrievalChunk, 'score'> | null {
    const fileName =
      variant === ResumeVariant.Backend
        ? 'backend.md'
        : variant === ResumeVariant.Ai
          ? 'ai.md'
          : 'generic.md';
    const path = join(this.knowledge.getRootPath(), 'resume', fileName);
    if (!existsSync(path)) {
      return null;
    }
    try {
      const { content } = matter(readFileSync(path, 'utf8'));
      return {
        id: `resume-${variant}`,
        sourceType: 'resume',
        title: `Resume (${variant})`,
        text: this.truncate(content.trim(), 3500),
      };
    } catch {
      return null;
    }
  }

  private tokenize(query: string): string[] {
    return query
      .toLowerCase()
      .split(/[^a-z0-9+#._-]+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 1 && !AGENT_STOP_WORDS.has(token));
  }

  private scoreText(haystack: string, tokens: string[]): number {
    if (tokens.length === 0) {
      return 0.1;
    }
    const lower = haystack.toLowerCase();
    let score = 0;
    for (const token of tokens) {
      if (lower.includes(token)) {
        score += 2;
        // Bonus for title-ish early occurrence
        if (lower.slice(0, 200).includes(token)) {
          score += 1;
        }
      }
    }
    return score;
  }

  private roleBias(
    options: RetrievalOptions,
    sourceType: RetrievalChunk['sourceType'],
  ): number {
    if (options.visitorRole === VisitorRole.Hiring) {
      if (sourceType === 'profile' || sourceType === 'experience') return 3;
      if (sourceType === 'project') return 1;
    }
    if (options.visitorRole === VisitorRole.Engineer) {
      if (sourceType === 'project' || sourceType === 'skill') return 2;
    }
    if (options.audience === Audience.Recruiter && sourceType === 'profile') {
      return 2;
    }
    return 0;
  }

  /** Prefer earlier narrativeOrder (AI first) on broad experience questions. */
  private actionBias(
    action: GrillAction | undefined,
    sourceType: RetrievalChunk['sourceType'],
  ): number {
    if (!action) return 0;
    switch (action) {
      case GrillAction.ShowReceipts:
        return sourceType === 'evidence' ? 8 : sourceType === 'project' ? 2 : 0;
      case GrillAction.ChallengeThis:
      case GrillAction.WhatCouldGoWrong:
        return sourceType === 'story' || sourceType === 'project' ? 4 : 0;
      case GrillAction.GoDeeper:
        return sourceType === 'project' || sourceType === 'story' ? 3 : 0;
      case GrillAction.ExplainSimply:
        return sourceType === 'project' || sourceType === 'skill' ? 2 : 0;
      default:
        return 0;
    }
  }

  private narrativeBoost(
    project: ProjectRecord,
    broadExperience: boolean,
  ): number {
    if (project.narrativeOrder == null) {
      return broadExperience ? -2 : 0;
    }
    if (!broadExperience) {
      // Still a light preference so lists stay coherent.
      return Math.max(0, 4 - Math.floor((project.narrativeOrder - 1) / 10));
    }
    if (project.pillar === ExperiencePillar.Ai) return 12;
    if (project.pillar === ExperiencePillar.Backend) return 9;
    if (project.pillar === ExperiencePillar.Platform) return 6;
    return Math.max(0, 8 - Math.floor(project.narrativeOrder / 5));
  }

  private isBroadExperienceQuery(query: string, tokens: string[]): boolean {
    const lower = query.toLowerCase();
    if (
      /what did you (build|work|do)|tell me about (your )?(experience|work|internship)|venwiz|background|walk me through your/i.test(
        lower,
      )
    ) {
      return true;
    }
    const markers = [
      'venwiz',
      'internship',
      'experience',
      'background',
      'built',
      'mmt',
    ];
    return markers.some((marker) => tokens.includes(marker));
  }

  private bodyLimit(grillMode: GrillMode, isProfile: boolean): number {
    if (isProfile) {
      return grillMode === GrillMode.WellDone ? 4000 : 2200;
    }
    switch (grillMode) {
      case GrillMode.WellDone:
        return 4500;
      case GrillMode.MediumRare:
        return 2800;
      default:
        return 1600;
    }
  }

  private truncate(text: string, max: number): string {
    if (text.length <= max) return text;
    return `${text.slice(0, max)}…`;
  }
}
