import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration.ts';
import { envValidationSchema } from './config/env.validation.ts';
import { AgentModule } from './agent/agent.module.ts';
import { ContactModule } from './contact/contact.module.ts';
import { GeminiModule } from './gemini/gemini.module.ts';
import { GithubModule } from './github/github.module.ts';
import { HealthModule } from './health/health.module.ts';
import { KnowledgeModule } from './knowledge/knowledge.module.ts';
import { ResumeModule } from './resume/resume.module.ts';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('throttle.ttlMs') ?? 60_000,
          limit: config.get<number>('throttle.limit') ?? 100,
        },
      ],
    }),
    HealthModule,
    GeminiModule,
    KnowledgeModule,
    AgentModule,
    ContactModule,
    ResumeModule,
    GithubModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
