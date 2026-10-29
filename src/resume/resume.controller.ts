import {
  Controller,
  Get,
  Header,
  Param,
  ParseEnumPipe,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { ResumeVariant } from '../shared/enums.ts';
import { ResumeService } from './resume.service.ts';

@Controller({ path: 'resumes', version: '1' })
export class ResumeController {
  constructor(private readonly resumes: ResumeService) {}

  @Get()
  list() {
    return { items: this.resumes.list() };
  }

  @Get(':variant')
  @Header('Cache-Control', 'public, max-age=300')
  getVariant(
    @Param('variant', new ParseEnumPipe(ResumeVariant)) variant: ResumeVariant,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = this.resumes.getFile(variant);
    res.setHeader('Content-Type', file.contentType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${file.fileName}"`,
    );
    return new StreamableFile(file.buffer);
  }
}
