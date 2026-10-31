import { Injectable } from '@nestjs/common';
import { KnowledgeService } from '../../knowledge/knowledge.service.ts';
import {
  Audience,
  GrillMode,
  ResumeVariant,
  SkillLevel,
  VisitorRole,
} from '../../shared/enums.ts';
import { AGENT_STOP_WORDS } from '../constants/agent.constants.ts';
import { RetrievalService } from './retrieval.service.ts';

export interface JdMatchedSkill {
  id: string;
  name: string;
  level: SkillLevel;
  score: number;
}

export interface JdMatchedProject {
  id: string;
  title: string;
  score: number;
  evidenceIds: string[];
}

export interface JdAnalysisResult {
  matchedSkills: JdMatchedSkill[];
  matchedProjects: JdMatchedProject[];
  evidenceIds: string[];
  gaps: string[];
  doNotClaim: string[];
  disclaimer: string;
}

@Injectable()
export class JdAnalysisService {
  constructor(
    private readonly knowledge: KnowledgeService,
    private readonly retrieval: RetrievalService,
  ) {}

  analyze(jdText: string, resumeVariant?: ResumeVariant): JdAnalysisResult {
    const tokens = this.tokenize(jdText);
    const retrieval = this.retrieval.retrieve({
      query: jdText.slice(0, 2000),
      grillMode: GrillMode.MediumRare,
      audience: Audience.Recruiter,
      visitorRole: VisitorRole.Hiring,
      resumeVariant,
    });

    const matchedSkills = this.knowledge
      .getSkills()
      .map((skill) => {
        const haystack =
          `${skill.name} ${skill.id} ${skill.summary ?? ''}`.toLowerCase();
        const score = tokens.reduce(
          (sum, token) => (haystack.includes(token) ? sum + 2 : sum),
          0,
        );
        return {
          id: skill.id,
          name: skill.name,
          level: skill.level,
          score,
        };
      })
      .filter((skill) => skill.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    const matchedProjects = this.knowledge
      .getPublicProjects()
      .map((project) => {
        const haystack =
          `${project.title} ${project.summary} ${project.stack.join(' ')} ${project.skillIds.join(' ')}`.toLowerCase();
        const score =
          tokens.reduce(
            (sum, token) => (haystack.includes(token) ? sum + 2 : sum),
            0,
          ) + (retrieval.projectIds.includes(project.id) ? 4 : 0);
        return {
          id: project.id,
          title: project.title,
          score,
          evidenceIds: project.evidenceIds.filter((id) =>
            this.knowledge.getPublicEvidenceIds().has(id),
          ),
        };
      })
      .filter((project) => project.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    const evidenceIds = [
      ...new Set([
        ...retrieval.evidenceIds,
        ...matchedProjects.flatMap((project) => project.evidenceIds),
      ]),
    ];

    const knownSkillTokens = new Set(
      this.knowledge.getSkills().flatMap((skill) =>
        this.tokenize(`${skill.name} ${skill.id} ${skill.summary ?? ''}`),
      ),
    );

    const gaps = this.extractJdRequirements(jdText)
      .filter((req) => {
        const reqTokens = this.tokenize(req);
        if (reqTokens.length === 0) return false;
        const covered = reqTokens.some((token) => knownSkillTokens.has(token));
        return !covered;
      })
      .slice(0, 8);

    const doNotClaim = this.buildDoNotClaim(matchedSkills, matchedProjects);

    return {
      matchedSkills,
      matchedProjects,
      evidenceIds,
      gaps,
      doNotClaim,
      disclaimer:
        'Honest grounded match against the public knowledge base only. Gaps are requirements that do not clearly map to documented skills/projects — not a judgment of ability.',
    };
  }

  private buildDoNotClaim(
    skills: JdMatchedSkill[],
    projects: JdMatchedProject[],
  ): string[] {
    const notes: string[] = [];
    for (const skill of skills) {
      if (skill.level === SkillLevel.Learning) {
        notes.push(
          `Do not claim production mastery of ${skill.name} — documented as learning.`,
        );
      }
    }
    for (const project of projects.slice(0, 5)) {
      const record = this.knowledge
        .getPublicProjects()
        .find((item) => item.id === project.id);
      if (!record) continue;
      const body = `${record.summary}\n${record.body}`;
      if (/do not (claim|present|imply)|not independently|avoid repeating/i.test(body)) {
        notes.push(
          `Treat metrics/impact for ${record.title} cautiously — source notes include claim limits.`,
        );
      }
      if (!record.evidenceIds.length) {
        notes.push(
          `No public evidence IDs linked for ${record.title} — do not invent receipts.`,
        );
      }
    }
    notes.push('Never invent employers, certifications, or unverified accuracy figures.');
    return [...new Set(notes)].slice(0, 10);
  }

  private extractJdRequirements(jdText: string): string[] {
    const lines = jdText
      .split(/\n+/)
      .map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim())
      .filter((line) => line.length > 12 && line.length < 160);

    const keywordHits = lines.filter((line) =>
      /\b(experience|required|must|proficien|knowledge of|familiar|years|strong)\b/i.test(
        line,
      ),
    );
    return (keywordHits.length ? keywordHits : lines).slice(0, 20);
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/[^a-z0-9+#._-]+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2 && !AGENT_STOP_WORDS.has(token));
  }
}
