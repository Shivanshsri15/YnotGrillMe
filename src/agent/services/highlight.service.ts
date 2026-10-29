import { Injectable } from '@nestjs/common';
import { KnowledgeService } from '../../knowledge/knowledge.service.ts';
import type {
  AnswerHighlight,
  HighlightKind,
  RetrievalResult,
} from '../interfaces/agent.interfaces.ts';

const MAX_HIGHLIGHTS = 5;
const MAX_TEXT = 140;

@Injectable()
export class HighlightService {
  constructor(private readonly knowledge: KnowledgeService) {}

  /**
   * Deterministic callouts from retrieval metadata — never invent metrics.
   */
  extract(retrieval: RetrievalResult): AnswerHighlight[] {
    const out: AnswerHighlight[] = [];
    const seen = new Set<string>();

    const push = (
      text: string,
      kind: HighlightKind,
      projectId?: string,
    ): void => {
      const cleaned = this.clean(text);
      if (!cleaned) return;
      const key = `${kind}:${cleaned.toLowerCase()}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ text: cleaned, kind, projectId });
    };

    for (const projectId of retrieval.projectIds) {
      if (out.length >= MAX_HIGHLIGHTS) break;
      const project = this.knowledge
        .getPublicProjects()
        .find((item) => item.id === projectId);
      if (!project) continue;

      if (project.stack.length) {
        push(
          `Stack: ${project.stack.slice(0, 5).join(', ')}`,
          'stack',
          project.id,
        );
      }

      const summaryLine = project.summary.split(/[.\n]/)[0]?.trim();
      if (summaryLine) {
        push(summaryLine, 'claim', project.id);
      }

      for (const line of this.lines(project.body)) {
        if (out.length >= MAX_HIGHLIGHTS) break;
        if (/trade-?off/i.test(line)) {
          push(line, 'tradeoff', project.id);
        } else if (
          /\b(outcome|result|impact|delivered|owned|shipped|reduced|eliminat)/i.test(
            line,
          )
        ) {
          push(line, 'outcome', project.id);
        }
      }
    }

    for (const chunk of retrieval.chunks) {
      if (out.length >= MAX_HIGHLIGHTS) break;
      if (chunk.sourceType !== 'story' && chunk.sourceType !== 'evidence') {
        continue;
      }
      const projectId = retrieval.projectIds[0];
      for (const line of this.lines(chunk.text)) {
        if (out.length >= MAX_HIGHLIGHTS) break;
        if (/trade-?off/i.test(line)) {
          push(line, 'tradeoff', projectId);
        } else if (chunk.sourceType === 'evidence') {
          push(chunk.title, 'claim', projectId);
          break;
        }
      }
    }

    return out.slice(0, MAX_HIGHLIGHTS);
  }

  private lines(text: string): string[] {
    return text
      .split(/\n+/)
      .map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim())
      .filter((line) => line.length > 24 && line.length < 220);
  }

  private clean(text: string): string {
    const compact = text.replace(/\s+/g, ' ').trim();
    if (compact.length <= MAX_TEXT) return compact;
    return `${compact.slice(0, MAX_TEXT - 1)}…`;
  }
}
