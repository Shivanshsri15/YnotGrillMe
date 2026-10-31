import { join } from 'node:path';
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Visibility } from '../shared/enums.ts';
import { DEFAULT_KNOWLEDGE_ROOT } from './constants/knowledge.constants.ts';
import type {
  EvidenceRecord,
  ExperienceRecord,
  KnowledgeIndex,
  ProfileRecord,
  ProjectArchitecture,
  ProjectRecord,
  SkillDetail,
  SkillRecord,
  StoryRecord,
} from './interfaces/knowledge.interfaces.ts';
import { KnowledgeLoader } from './knowledge.loader.ts';

export type ProjectListItem = Omit<ProjectRecord, 'body' | 'readmeSynced'>;
export type StoryListItem = Omit<StoryRecord, 'body'>;

@Injectable()
export class KnowledgeService implements OnModuleInit {
  private index: KnowledgeIndex = {
    profile: null,
    experience: [],
    projects: [],
    skills: [],
    evidence: [],
    stories: [],
    loadedAt: new Date(0).toISOString(),
    rootPath: '',
  };

  constructor(
    private readonly loader: KnowledgeLoader,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    this.reindex();
  }

  reindex(rootPath?: string): KnowledgeIndex {
    const configuredRoot = this.config.get<string>('knowledge.root');
    const resolved =
      rootPath ??
      configuredRoot ??
      join(process.cwd(), DEFAULT_KNOWLEDGE_ROOT);
    this.index = this.loader.load(resolved);
    return this.index;
  }

  getIndexMeta() {
    return {
      loadedAt: this.index.loadedAt,
      rootPath: this.index.rootPath,
      counts: {
        profile: this.index.profile ? 1 : 0,
        experience: this.index.experience.length,
        projects: this.index.projects.length,
        skills: this.index.skills.length,
        evidence: this.index.evidence.length,
        stories: this.index.stories.length,
      },
    };
  }

  getProfile(includePrivate = false): ProfileRecord | null {
    const profile = this.index.profile;
    if (!profile) {
      return null;
    }
    if (!includePrivate && profile.visibility !== Visibility.Public) {
      return null;
    }
    return profile;
  }

  getExperience(includePrivate = false): ExperienceRecord[] {
    return this.filterPublic(this.index.experience, includePrivate);
  }

  listProjects(includePrivate = false): ProjectListItem[] {
    return this.filterPublic(this.index.projects, includePrivate).map(
      (project) => {
        const { body: _body, readmeSynced: _readme, ...rest } = project;
        return rest;
      },
    );
  }

  getProject(id: string, includePrivate = false): ProjectRecord {
    const project = this.index.projects.find((item) => item.id === id);
    if (
      !project ||
      (!includePrivate && project.visibility !== Visibility.Public)
    ) {
      throw new NotFoundException(`Project "${id}" not found`);
    }
    return project;
  }

  getProjectArchitecture(
    id: string,
    includePrivate = false,
  ): ProjectArchitecture {
    const project = this.getProject(id, includePrivate);
    if (!project.architecture) {
      throw new NotFoundException(
        `Architecture for project "${id}" not found`,
      );
    }
    return project.architecture;
  }

  getSkills(): SkillRecord[] {
    return [...this.index.skills];
  }

  getSkill(id: string): SkillDetail {
    const skill = this.index.skills.find((item) => item.id === id);
    if (!skill) {
      throw new NotFoundException(`Skill "${id}" not found`);
    }
    return {
      ...skill,
      relatedProjects: this.listProjects()
        .filter((project) => skill.projectIds.includes(project.id))
        .map((project) => ({
          id: project.id,
          title: project.title,
          summary: project.summary,
          stack: project.stack,
        })),
    };
  }

  listEvidence(includePrivate = false): EvidenceRecord[] {
    return this.filterPublic(this.index.evidence, includePrivate);
  }

  getEvidenceById(id: string, includePrivate = false): EvidenceRecord {
    const evidence = this.index.evidence.find((item) => item.id === id);
    if (
      !evidence ||
      (!includePrivate && evidence.visibility !== Visibility.Public)
    ) {
      throw new NotFoundException(`Evidence "${id}" not found`);
    }
    return evidence;
  }

  listStories(includePrivate = false): StoryListItem[] {
    return this.filterPublic(this.index.stories, includePrivate).map(
      ({ body: _body, ...rest }) => rest,
    );
  }

  getStory(id: string, includePrivate = false): StoryRecord {
    const story = this.index.stories.find((item) => item.id === id);
    if (!story || (!includePrivate && story.visibility !== Visibility.Public)) {
      throw new NotFoundException(`Story "${id}" not found`);
    }
    return story;
  }

  /** Full public projects including body — for retrieval / agent context. */
  getPublicProjects(): ProjectRecord[] {
    return this.filterPublic(this.index.projects, false);
  }

  /** Full public stories including body — for retrieval / agent context. */
  getPublicStories(): StoryRecord[] {
    return this.filterPublic(this.index.stories, false);
  }

  getPublicEvidenceIds(): Set<string> {
    return new Set(this.listEvidence(false).map((item) => item.id));
  }

  getRootPath(): string {
    return this.index.rootPath;
  }

  private filterPublic<T extends { visibility: Visibility }>(
    items: T[],
    includePrivate: boolean,
  ): T[] {
    if (includePrivate) {
      return [...items];
    }
    return items.filter((item) => item.visibility === Visibility.Public);
  }
}
