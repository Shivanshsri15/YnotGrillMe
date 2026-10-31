import { Module } from '@nestjs/common';
import { AgentChatController } from './controllers/agent-chat.controller.ts';
import { AgentJdController } from './controllers/agent-jd.controller.ts';
import { ChatService } from './services/chat.service.ts';
import { HighlightService } from './services/highlight.service.ts';
import { JdAnalysisService } from './services/jd-analysis.service.ts';
import { PromptBuilder } from './services/prompt.builder.ts';
import { RabbitHoleService } from './services/rabbit-hole.service.ts';
import { RetrievalService } from './services/retrieval.service.ts';
import { SessionStore } from './services/session.store.ts';

@Module({
  controllers: [AgentChatController, AgentJdController],
  providers: [
    SessionStore,
    RetrievalService,
    PromptBuilder,
    RabbitHoleService,
    HighlightService,
    ChatService,
    JdAnalysisService,
  ],
  exports: [ChatService, SessionStore, RetrievalService, JdAnalysisService],
})
export class AgentModule {}
