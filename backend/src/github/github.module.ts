import { Module } from '@nestjs/common';
import { GithubController } from './github.controller.ts';
import { GithubSyncService } from './github-sync.service.ts';

@Module({
  controllers: [GithubController],
  providers: [GithubSyncService],
  exports: [GithubSyncService],
})
export class GithubModule {}
