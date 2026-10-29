import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import {
  AGENT_CHAT_THROTTLE_LIMIT,
  AGENT_CHAT_THROTTLE_TTL_MS,
} from '../constants/agent.constants.ts';
import { ChatRequestDto } from '../dto/chat-request.dto.ts';
import { GrillRequestDto } from '../dto/grill-request.dto.ts';
import { ChatService, type ChatSseEvent } from '../services/chat.service.ts';

@Controller({ path: 'agent', version: '1' })
export class AgentChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('suggestions')
  getSuggestions() {
    return {
      items: this.chatService.getStarterSuggestions(),
    };
  }

  @Get('sessions/:conversationId/recap')
  getRecap(
    @Param('conversationId', new ParseUUIDPipe({ version: '4' }))
    conversationId: string,
  ) {
    return this.chatService.getRecap(conversationId);
  }

  @Post('chat')
  @Throttle({
    default: {
      limit: AGENT_CHAT_THROTTLE_LIMIT,
      ttl: AGENT_CHAT_THROTTLE_TTL_MS,
    },
  })
  async chat(@Body() body: ChatRequestDto, @Res() res: Response) {
    await this.writeSse(res, this.chatService.chat(body));
  }

  @Post('grill')
  @Throttle({
    default: {
      limit: AGENT_CHAT_THROTTLE_LIMIT,
      ttl: AGENT_CHAT_THROTTLE_TTL_MS,
    },
  })
  async grill(@Body() body: GrillRequestDto, @Res() res: Response) {
    await this.writeSse(res, this.chatService.grill(body));
  }

  private async writeSse(
    res: Response,
    events: AsyncGenerator<ChatSseEvent>,
  ): Promise<void> {
    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    try {
      for await (const event of events) {
        res.write(`event: ${event.event}\n`);
        res.write(`data: ${JSON.stringify(event.data)}\n\n`);
      }
    } catch {
      res.write('event: error\n');
      res.write(
        `data: ${JSON.stringify({ message: 'Unexpected chat failure.' })}\n\n`,
      );
      res.write(
        `event: done\ndata: ${JSON.stringify({ finishReason: 'error' })}\n\n`,
      );
    } finally {
      res.end();
    }
  }
}
