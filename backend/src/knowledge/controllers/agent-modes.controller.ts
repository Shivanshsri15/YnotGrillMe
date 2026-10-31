import { Controller, Get } from '@nestjs/common';
import {
  AnswerDepth,
  Audience,
  GrillAction,
  GrillMode,
  ResumeVariant,
} from '../../shared/enums.ts';

@Controller({ path: 'agent', version: '1' })
export class AgentModesController {
  @Get('modes')
  getModes() {
    return {
      grillModes: [
        {
          id: GrillMode.WarmUp,
          label: 'Warm-up',
          description: 'Hook-length answers; click suggestions to go deeper',
        },
        {
          id: GrillMode.MediumRare,
          label: 'Medium Rare',
          description: 'APIs, data choices, implementation shape, and trade-offs',
        },
        {
          id: GrillMode.WellDone,
          label: 'Well Done',
          description:
            'Edge cases, security/performance notes, and documented challenges',
        },
      ],
      answerDepths: [
        {
          id: AnswerDepth.Hook,
          label: 'Hook',
          description:
            '1–2 curiosity lines. Default for browsing. Suggestions are the next click.',
        },
        {
          id: AnswerDepth.Deep,
          label: 'Deep',
          description:
            'Short narrative + trade-off when the visitor expands a thread.',
        },
      ],
      audiences: Object.values(Audience),
      actions: Object.values(GrillAction),
      resumeVariants: Object.values(ResumeVariant),
    };
  }
}
