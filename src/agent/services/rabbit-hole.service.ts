import { Injectable } from '@nestjs/common';
import { AnswerDepth } from '../../shared/enums.ts';
import { KnowledgeService } from '../../knowledge/knowledge.service.ts';
import type {
  RabbitHoleSuggestion,
  RetrievalResult,
} from '../interfaces/agent.interfaces.ts';

/** Hand-tuned curiosity hooks for known interview stories. */
const STORY_HOOKS: Record<string, { label: string; ask: string }> = {
  'story-hawkai-tradeoff': {
    label: 'When should an LLM not own the numbers?',
    ask: 'In HawkAI, why keep business signals deterministic and use the LLM only for synthesis—what breaks if you flip that trade-off?',
  },
  'story-status-consistency': {
    label: 'Five servers, five different PO statuses?',
    ask: 'Walk me through the statusData v2 story: how did duplicated status logic drift, and what trade-offs came with centralizing it?',
  },
  'story-offline-sync': {
    label: 'Field work with no signal—what do you trust?',
    ask: 'Tell the offline sync story: why queue writes sequentially, and what trade-offs did timestamp conflict handling force?',
  },
  'story-rich-text-security': {
    label: 'Pretty comments vs XSS—who wins?',
    ask: 'How did you keep rich-text formatting consistent across UI, Excel, email, and AI while still mitigating XSS—what did you refuse to trust?',
  },
  'story-precision': {
    label: 'Reviewing a diff without the rest of the repo?',
    ask: 'What problem pushed PReCision toward repository-aware retrieval instead of reviewing only the changed lines—and what trade-offs did that create?',
  },
};

/** Project click-targets — never use raw resume summary text as the chip label. */
const PROJECT_HOOKS: Record<string, { label: string; ask: string }> = {
  'offline-first-mobile': {
    label: 'Sync that works when the field goes dark',
    ask: 'How did the offline-first MMT mobile sync work, and what trade-offs did sequential queues and timestamp conflicts force?',
  },
  'status-engine': {
    label: 'One status engine instead of five truths',
    ask: 'Why did statusData v2 centralize PO status/risk computation, and what broke before that?',
  },
  'workspace-insights-hawkai': {
    label: 'Deterministic signals, LLM synthesis',
    ask: 'How did HawkAI separate deterministic MongoDB signals from LLM synthesis, and why was that boundary important?',
  },
  'po-ingestion': {
    label: 'Excel-to-PO without the mapping mess',
    ask: 'What made L&T Excel-to-PO ingestion hard, and what did you automate versus leave explicit?',
  },
  'access-control': {
    label: 'UAC/RBAC without leaking company data',
    ask: 'What problem did the UAC/RBAC work solve on MMT, and where do permissions have to be enforced?',
  },
  'rich-text-security': {
    label: 'Rich text that stays safe across surfaces',
    ask: 'How did rich-text comments stay consistent across UI, Excel, email, and AI without opening XSS holes?',
  },
  precision: {
    label: 'Code review that sees past the diff',
    ask: 'What made PReCision retrieve repository context instead of reviewing only changed lines?',
  },
  'scheduled-pipelines': {
    label: 'Ten+ jobs keeping ops dashboards honest',
    ask: 'What did the scheduled/event-driven pipelines actually own, and where did reliability matter most?',
  },
};

/** Starters follow AI → backend → platform. */
const FEATURED_STARTER_STORY_IDS = [
  'story-hawkai-tradeoff',
  'story-precision',
  'story-status-consistency',
  'story-offline-sync',
  'story-rich-text-security',
] as const;

const PILLAR_RANK: Record<string, number> = {
  ai: 0,
  backend: 1,
  platform: 2,
};

@Injectable()
export class RabbitHoleService {
  constructor(private readonly knowledge: KnowledgeService) {}

  build(
    retrieval: RetrievalResult,
    validatedEvidenceIds: string[],
    options?: { depth?: AnswerDepth },
  ): RabbitHoleSuggestion[] {
    const items: RabbitHoleSuggestion[] = [];
    const seenStoryIds = new Set<string>();
    const seenAskKeys = new Set<string>();
    const isHook = (options?.depth ?? AnswerDepth.Hook) === AnswerDepth.Hook;

    const pushAsk = (item: RabbitHoleSuggestion) => {
      if (items.length >= 3) return;
      if (item.action.kind !== 'ask') {
        items.push(item);
        return;
      }
      const key = item.action.message.toLowerCase();
      if (seenAskKeys.has(key)) return;
      seenAskKeys.add(key);
      items.push(item);
    };

    // After a hook answer, chips are the prompt chain — click = deep dive.
    for (const storyId of this.collectStoryIds(retrieval)) {
      if (items.length >= 3) break;
      if (seenStoryIds.has(storyId)) continue;
      seenStoryIds.add(storyId);
      const hook = this.storyHook(storyId);
      if (hook) pushAsk(hook);
    }

    const orderedProjectIds = [...retrieval.projectIds].sort((a, b) => {
      const ap = this.projectPillarRank(a);
      const bp = this.projectPillarRank(b);
      return ap - bp;
    });

    for (const projectId of orderedProjectIds) {
      if (items.length >= 3) break;
      const hook = this.projectTradeoffHook(projectId);
      if (hook) pushAsk(hook);
    }

    // If retrieval was thin, still offer Venwiz story chain after broad asks.
    if (isHook && items.length < 3) {
      for (const storyId of FEATURED_STARTER_STORY_IDS) {
        if (items.length >= 3) break;
        if (seenStoryIds.has(storyId)) continue;
        const hook = this.storyHook(storyId);
        if (hook) {
          seenStoryIds.add(storyId);
          pushAsk(hook);
        }
      }
    }

    for (const evidenceId of validatedEvidenceIds) {
      if (items.length >= 3) break;
      try {
        const evidence = this.knowledge.getEvidenceById(evidenceId);
        items.push({
          type: 'evidence',
          label: `Receipts for: ${this.shortTitle(evidence.title)}`,
          action: { kind: 'open_evidence', id: evidence.id },
        });
      } catch {
        // skip missing
      }
    }

    if (items.length === 0) {
      return this.starterQuestions().slice(0, 3);
    }

    return items.slice(0, 3);
  }

  starterQuestions(): RabbitHoleSuggestion[] {
    const items: RabbitHoleSuggestion[] = [];
    const seen = new Set<string>();

    for (const storyId of FEATURED_STARTER_STORY_IDS) {
      if (items.length >= 5) break;
      const hook = this.storyHook(storyId);
      if (!hook || seen.has(storyId)) continue;
      seen.add(storyId);
      items.push(hook);
    }

    for (const story of this.knowledge.listStories()) {
      if (items.length >= 5) break;
      if (seen.has(story.id)) continue;
      const hook = this.storyHook(story.id);
      if (!hook) continue;
      seen.add(story.id);
      items.push(hook);
    }

    if (items.length === 0) {
      items.push({
        type: 'question',
        label: 'What broke when status logic lived in five places?',
        action: {
          kind: 'ask',
          depth: AnswerDepth.Deep,
          message:
            'Tell me about a production consistency problem you fixed and the trade-offs behind the fix.',
        },
      });
    }

    return items.slice(0, 5);
  }

  private collectStoryIds(retrieval: RetrievalResult): string[] {
    const curatedFirst = [
      ...FEATURED_STARTER_STORY_IDS.filter((id) => {
        try {
          const story = this.knowledge.getStory(id);
          return (
            retrieval.storyIds.includes(id) ||
            story.projectIds.some((projectId) =>
              retrieval.projectIds.includes(projectId),
            )
          );
        } catch {
          return false;
        }
      }),
      ...retrieval.storyIds,
    ];

    const ordered: string[] = [];
    const seen = new Set<string>();

    for (const storyId of curatedFirst) {
      if (this.isBulkNarrative(storyId) || seen.has(storyId)) continue;
      ordered.push(storyId);
      seen.add(storyId);
    }

    for (const story of this.knowledge.listStories()) {
      if (this.isBulkNarrative(story.id) || seen.has(story.id)) continue;
      const linked = story.projectIds.some((id) =>
        retrieval.projectIds.includes(id),
      );
      if (linked) {
        ordered.push(story.id);
        seen.add(story.id);
      }
    }

    return ordered;
  }

  private isBulkNarrative(storyId: string): boolean {
    return storyId === 'interview-narratives';
  }

  private projectPillarRank(projectId: string): number {
    try {
      const project = this.knowledge.getProject(projectId);
      if (project.pillar && project.pillar in PILLAR_RANK) {
        return PILLAR_RANK[project.pillar];
      }
      return project.narrativeOrder ?? 99;
    } catch {
      return 99;
    }
  }

  private storyHook(storyId: string): RabbitHoleSuggestion | null {
    if (this.isBulkNarrative(storyId)) {
      return null;
    }

    const curated = STORY_HOOKS[storyId];
    if (curated) {
      return {
        type: 'story',
        label: curated.label,
        action: {
          kind: 'ask',
          depth: AnswerDepth.Deep,
          message: curated.ask,
        },
      };
    }

    try {
      const story = this.knowledge.getStory(storyId);
      return {
        type: 'story',
        label: this.truncate(this.stripMarkdown(story.title), 72),
        action: {
          kind: 'ask',
          depth: AnswerDepth.Deep,
          message: `Go deeper on "${story.title}": what was the hard problem, what did you try, and what trade-off did you accept?`,
        },
      };
    } catch {
      return null;
    }
  }

  private projectTradeoffHook(projectId: string): RabbitHoleSuggestion | null {
    const curated = PROJECT_HOOKS[projectId];
    if (curated) {
      return {
        type: 'project',
        label: curated.label,
        action: {
          kind: 'ask',
          depth: AnswerDepth.Deep,
          message: curated.ask,
        },
      };
    }

    try {
      const project = this.knowledge.getProject(projectId);
      return {
        type: 'project',
        label: this.truncate(project.title, 72),
        action: {
          kind: 'ask',
          depth: AnswerDepth.Deep,
          message: `Go deeper on ${project.title}: what was the core engineering tension and which trade-off shaped the design?`,
        },
      };
    } catch {
      return null;
    }
  }

  private stripMarkdown(text: string): string {
    return text
      .replace(/\*\*/g, '')
      .replace(/^["']|["']$/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private shortTitle(title: string): string {
    return this.truncate(this.stripMarkdown(title), 48);
  }

  private truncate(text: string, max: number): string {
    if (text.length <= max) return text;
    return `${text.slice(0, max - 1).trimEnd()}…`;
  }
}
