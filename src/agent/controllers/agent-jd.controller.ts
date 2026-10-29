import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  AGENT_CHAT_THROTTLE_LIMIT,
  AGENT_CHAT_THROTTLE_TTL_MS,
} from '../constants/agent.constants.ts';
import { JdRequestDto } from '../dto/jd-request.dto.ts';
import { JdAnalysisService } from '../services/jd-analysis.service.ts';

@Controller({ path: 'agent', version: '1' })
export class AgentJdController {
  constructor(private readonly jdAnalysis: JdAnalysisService) {}

  @Post('jd')
  @Throttle({
    default: {
      limit: AGENT_CHAT_THROTTLE_LIMIT,
      ttl: AGENT_CHAT_THROTTLE_TTL_MS,
    },
  })
  analyze(@Body() body: JdRequestDto) {
    return this.jdAnalysis.analyze(body.jdText, body.resumeVariant);
  }
}
