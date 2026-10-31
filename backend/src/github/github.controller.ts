import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import {
  GITHUB_SYNC_THROTTLE_LIMIT,
  GITHUB_SYNC_THROTTLE_TTL_MS,
  GITHUB_WEBHOOK_THROTTLE_LIMIT,
  GITHUB_WEBHOOK_THROTTLE_TTL_MS,
} from './constants/github.constants.ts';
import { GithubSyncDto } from './dto/github-sync.dto.ts';
import { GithubSyncService } from './github-sync.service.ts';

@Controller({ path: 'github', version: '1' })
export class GithubController {
  constructor(private readonly github: GithubSyncService) {}

  @Get('syncable')
  listSyncable() {
    return { items: this.github.listSyncable() };
  }

  @Post('sync')
  @Throttle({
    default: {
      limit: GITHUB_SYNC_THROTTLE_LIMIT,
      ttl: GITHUB_SYNC_THROTTLE_TTL_MS,
    },
  })
  async sync(@Body() body: GithubSyncDto) {
    if (body.projectId) {
      return { results: [await this.github.syncProject(body.projectId)] };
    }
    return { results: await this.github.syncAll() };
  }

  @Post('webhook')
  @Throttle({
    default: {
      limit: GITHUB_WEBHOOK_THROTTLE_LIMIT,
      ttl: GITHUB_WEBHOOK_THROTTLE_TTL_MS,
    },
  })
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-hub-signature-256') signature: string | undefined,
    @Body() body: unknown,
  ) {
    const raw = req.rawBody;
    if (!raw) {
      throw new UnauthorizedException('Raw body unavailable for signature check');
    }
    this.github.verifyWebhookSignature(raw, signature);
    const result = await this.github.handleWebhookPayload(body);
    return result;
  }
}
