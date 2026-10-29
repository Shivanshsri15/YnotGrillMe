import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import matter from 'gray-matter';
import { ExperiencePillar, SkillLevel, Visibility } from '../shared/enums.ts';
import {
  DEFAULT_KNOWLEDGE_ROOT,
  KNOWLEDGE_PATHS,
} from './constants/knowledge.constants.ts';
import type {
  EvidenceRecord,
  ExperienceRecord,
  KnowledgeIndex,
  ProfileRecord,
  ProjectArchitecture,
  ProjectRecord,
  SkillRecord,
  StoryRecord,
} from './interfaces/knowledge.interfaces.ts';

@Injectable()
export class KnowledgeLoader {
  private readonly logger = new Logger(KnowledgeLoader.name);

  load(rootPath = join(process.cwd(), DEFAULT_KNOWLEDGE_ROOT)): KnowledgeIndex {
    const index: KnowledgeIndex = {
      profile: null,
      experience: [],
      projects: [],
      skills: [],
      evidence: [],
      stories: [],
      loadedAt: new Date().toISOString(),
      rootPath,
    };

    if (!existsSync(rootPath)) {
      this.logger.warn(`Knowledge root not found at ${rootPath}`);
      return index;
    }

    index.profile = this.loadProfile(join(rootPath, KNOWLEDGE_PATHS.profile));
    index.skills = this.loadSkills(join(rootPath, KNOWLEDGE_PATHS.skills));
    index.experience = this.loadMarkdownCollection(
      join(rootPath, KNOWLEDGE_PATHS.experienceDir),
      (file, data, body) => this.mapExperience(file, data, body),
    );
    index.evidence = this.loadMarkdownCollection(
      join(rootPath, KNOWLEDGE_PATHS.evidenceDir),
      (file, data, body) => this.mapEvidence(file, data, body),
    );
    index.stories = this.loadMarkdownCollection(
      join(rootPath, KNOWLEDGE_PATHS.storiesDir),
      (file, data, body) => this.mapStory(file, data, body),
    );
    index.projects = this.loadProjects(
      join(rootPath, KNOWLEDGE_PATHS.projectsDir),
    );

    this.logger.log(
      `Knowledge loaded from ${rootPath}: ` +
        `profile=${index.profile ? 1 : 0}, ` +
        `experience=${index.experience.length}, ` +
        `projects=${index.projects.length}, ` +
        `skills=${index.skills.length}, ` +
        `evidence=${index.evidence.length}, ` +
        `stories=${index.stories.length}`,
    );

    return index;
  }

  private loadProfile(filePath: string): ProfileRecord | null {
    if (!existsSync(filePath)) {
      return null;
    }

    try {
      const { data, content } = matter(readFileSync(filePath, 'utf8'));
      const name = this.asString(data.name);
      if (!name) {
        this.logger.warn(`Skipping profile.md — missing required "name"`);
        return null;
      }

      return {
        name,
        headline: this.asString(data.headline) ?? '',
        summary: this.asString(data.summary) ?? this.firstParagraph(content),
        body: content.trim(),
        links: {
          github: this.asOptionalString(data.links?.github ?? data.github),
          linkedin: this.asOptionalString(
            data.links?.linkedin ?? data.linkedin,
          ),
          website: this.asOptionalString(data.links?.website ?? data.website),
          email: this.asOptionalString(data.links?.email ?? data.email),
        },
        schedulingUrl: this.asOptionalString(data.schedulingUrl),
        contactEnabled: this.asBoolean(data.contactEnabled, false),
        visibility: this.asVisibility(data.visibility),
      };
    } catch (error) {
      this.logger.warn(`Failed to parse profile.md: ${String(error)}`);
      return null;
    }
  }

  private loadSkills(filePath: string): SkillRecord[] {
    if (!existsSync(filePath)) {
      return [];
    }

    try {
      const { data } = matter(readFileSync(filePath, 'utf8'));
      const rawSkills = Array.isArray(data.skills) ? data.skills : [];
      return rawSkills
        .map((item: unknown) => this.mapSkill(item))
        .filter((skill): skill is SkillRecord => skill !== null);
    } catch (error) {
      this.logger.warn(`Failed to parse skills.md: ${String(error)}`);
      return [];
    }
  }

  private mapSkill(item: unknown): SkillRecord | null {
    if (!item || typeof item !== 'object') {
      return null;
    }
    const data = item as Record<string, unknown>;
    const id = this.asString(data.id);
    const name = this.asString(data.name);
    if (!id || !name) {
      return null;
    }

    return {
      id,
      name,
      level: this.asSkillLevel(data.level),
      summary: this.asOptionalString(data.summary),
      projectIds: this.asStringArray(data.projectIds),
      evidenceIds: this.asStringArray(data.evidenceIds),
    };
  }

  private loadProjects(dirPath: string): ProjectRecord[] {
    if (!existsSync(dirPath)) {
      return [];
    }

    const files = readdirSync(dirPath).filter(
      (name) =>
        name.endsWith('.md') &&
        !name.endsWith('.readme.synced.md') &&
        !name.startsWith('_'),
    );

    const projects: ProjectRecord[] = [];
    for (const file of files) {
      const projectId = basename(file, '.md');
      const filePath = join(dirPath, file);
      try {
        const { data, content } = matter(readFileSync(filePath, 'utf8'));
        const id = this.asString(data.id) ?? projectId;
        const title = this.asString(data.title);
        if (!title) {
          this.logger.warn(`Skipping ${file} — missing required "title"`);
          continue;
        }

        const architecturePath = join(dirPath, `${projectId}.architecture.json`);
        const readmePath = join(dirPath, `${projectId}.readme.synced.md`);

        projects.push({
          id,
          title,
          summary: this.asString(data.summary) ?? this.firstParagraph(content),
          body: content.trim(),
          stack: this.asStringArray(data.stack),
          repo: this.asOptionalString(data.repo),
          defaultBranch: this.asString(data.defaultBranch) ?? 'main',
          readmeSync: this.asBoolean(data.readmeSync, false),
          skillIds: this.asStringArray(data.skillIds),
          evidenceIds: this.asStringArray(data.evidenceIds),
          visibility: this.asVisibility(data.visibility),
          pillar: this.asPillar(data.pillar),
          narrativeOrder: this.asOptionalNumber(data.narrativeOrder),
          architecture: this.loadArchitecture(architecturePath),
          readmeSynced: existsSync(readmePath)
            ? readFileSync(readmePath, 'utf8')
            : undefined,
        });
      } catch (error) {
        this.logger.warn(`Failed to parse ${file}: ${String(error)}`);
      }
    }

    return projects.sort((a, b) => {
      const ao = a.narrativeOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = b.narrativeOrder ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a.title.localeCompare(b.title);
    });
  }

  private loadArchitecture(filePath: string): ProjectArchitecture | undefined {
    if (!existsSync(filePath)) {
      return undefined;
    }

    try {
      const raw = JSON.parse(readFileSync(filePath, 'utf8')) as Partial<
        ProjectArchitecture
      >;
      return {
        nodes: Array.isArray(raw.nodes) ? raw.nodes : [],
        edges: Array.isArray(raw.edges) ? raw.edges : [],
        flows: Array.isArray(raw.flows) ? raw.flows : [],
      };
    } catch (error) {
      this.logger.warn(
        `Failed to parse architecture file ${filePath}: ${String(error)}`,
      );
      return undefined;
    }
  }

  private loadMarkdownCollection<T>(
    dirPath: string,
    mapper: (
      fileName: string,
      data: Record<string, unknown>,
      body: string,
    ) => T | null,
  ): T[] {
    if (!existsSync(dirPath)) {
      return [];
    }

    const files = readdirSync(dirPath).filter((name) => name.endsWith('.md'));
    const items: T[] = [];

    for (const file of files) {
      try {
        const { data, content } = matter(
          readFileSync(join(dirPath, file), 'utf8'),
        );
        const mapped = mapper(
          file,
          data as Record<string, unknown>,
          content.trim(),
        );
        if (mapped) {
          items.push(mapped);
        }
      } catch (error) {
        this.logger.warn(`Failed to parse ${file}: ${String(error)}`);
      }
    }

    return items;
  }

  private mapExperience(
    fileName: string,
    data: Record<string, unknown>,
    body: string,
  ): ExperienceRecord | null {
    const id = this.asString(data.id) ?? basename(fileName, '.md');
    const company = this.asString(data.company);
    const role = this.asString(data.role);
    if (!company || !role) {
      this.logger.warn(
        `Skipping ${fileName} — missing required company/role`,
      );
      return null;
    }

    return {
      id,
      company,
      role,
      dates: this.asString(data.dates) ?? '',
      summary: this.asString(data.summary) ?? this.firstParagraph(body),
      body,
      skillIds: this.asStringArray(data.skillIds),
      visibility: this.asVisibility(data.visibility),
    };
  }

  private mapEvidence(
    fileName: string,
    data: Record<string, unknown>,
    body: string,
  ): EvidenceRecord | null {
    const id = this.asString(data.id) ?? basename(fileName, '.md');
    const title = this.asString(data.title);
    if (!title) {
      this.logger.warn(`Skipping ${fileName} — missing required "title"`);
      return null;
    }

    return {
      id,
      title,
      type: this.asString(data.type) ?? 'note',
      url: this.asOptionalString(data.url),
      supports: this.asString(data.supports) ?? '',
      body,
      projectIds: this.asStringArray(data.projectIds),
      skillIds: this.asStringArray(data.skillIds),
      visibility: this.asVisibility(data.visibility),
    };
  }

  private mapStory(
    fileName: string,
    data: Record<string, unknown>,
    body: string,
  ): StoryRecord | null {
    const id = this.asString(data.id) ?? basename(fileName, '.md');
    const title = this.asString(data.title);
    if (!title) {
      this.logger.warn(`Skipping ${fileName} — missing required "title"`);
      return null;
    }

    return {
      id,
      title,
      summary: this.asString(data.summary) ?? this.firstParagraph(body),
      body,
      tags: this.asStringArray(data.tags),
      projectIds: this.asStringArray(data.projectIds),
      skillIds: this.asStringArray(data.skillIds),
      visibility: this.asVisibility(data.visibility),
    };
  }

  private asVisibility(value: unknown): Visibility {
    return value === Visibility.Private
      ? Visibility.Private
      : Visibility.Public;
  }

  private asSkillLevel(value: unknown): SkillLevel {
    if (
      value === SkillLevel.Production ||
      value === SkillLevel.Project ||
      value === SkillLevel.Learning
    ) {
      return value;
    }
    return SkillLevel.Project;
  }

  private asPillar(value: unknown): ExperiencePillar | undefined {
    if (
      value === ExperiencePillar.Ai ||
      value === ExperiencePillar.Backend ||
      value === ExperiencePillar.Platform
    ) {
      return value;
    }
    return undefined;
  }

  private asOptionalNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return undefined;
  }

  private asString(value: unknown): string | undefined {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number') {
      return String(value);
    }
    return undefined;
  }

  private asOptionalString(value: unknown): string | undefined {
    return this.asString(value);
  }

  private asBoolean(value: unknown, fallback: boolean): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    return fallback;
  }

  private asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .map((item) => this.asString(item))
      .filter((item): item is string => Boolean(item));
  }

  private firstParagraph(content: string): string {
    const paragraph = content
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .find(Boolean);
    return paragraph ?? '';
  }
}
