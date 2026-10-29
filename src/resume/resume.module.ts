import { Module } from '@nestjs/common';
import { ResumeController } from './resume.controller.ts';
import { ResumeService } from './resume.service.ts';

@Module({
  controllers: [ResumeController],
  providers: [ResumeService],
  exports: [ResumeService],
})
export class ResumeModule {}
