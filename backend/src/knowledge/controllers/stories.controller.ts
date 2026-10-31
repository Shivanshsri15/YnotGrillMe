import { Controller, Get, Param, Query } from '@nestjs/common';
import { KnowledgeService } from '../knowledge.service.ts';

@Controller({ path: 'stories', version: '1' })
export class StoriesController {
  constructor(private readonly knowledge: KnowledgeService) {}

  @Get()
  listStories(@Query('tag') tag?: string) {
    const items = this.knowledge.listStories();
    return {
      items: tag
        ? items.filter((story) =>
            story.tags.map((value) => value.toLowerCase()).includes(tag.toLowerCase()),
          )
        : items,
    };
  }

  @Get(':id')
  getStory(@Param('id') id: string) {
    return this.knowledge.getStory(id);
  }
}
