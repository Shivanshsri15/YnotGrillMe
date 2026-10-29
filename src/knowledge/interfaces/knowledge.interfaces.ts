import type {
  ExperiencePillar,
  SkillLevel,
  Visibility,
} from '../../shared/enums.ts';

export interface ProfileRecord {
  name: string;
  headline: string;
  summary: string;
  body: string;
  links: {
    github?: string;
    linkedin?: string;
    website?: string;
    email?: string;
  };
  schedulingUrl?: string;
  contactEnabled: boolean;
  visibility: Visibility;
}

export interface ExperienceRecord {
  id: string;
  company: string;
  role: string;
  dates: string;
  summary: string;
  body: string;
  skillIds: string[];
  visibility: Visibility;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  description?: string;
  type?: string;
}

export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ArchitectureFlow {
  id: string;
  label: string;
  steps: string[];
  description?: string;
}

export interface ProjectArchitecture {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  flows: ArchitectureFlow[];
}

export interface ProjectRecord {
  id: string;
  title: string;
  summary: string;
  body: string;
  stack: string[];
  repo?: string;
  defaultBranch: string;
  readmeSync: boolean;
  skillIds: string[];
  evidenceIds: string[];
  visibility: Visibility;
  /** AI → backend → platform narrative lane. */
  pillar?: ExperiencePillar;
  /** Lower = earlier in the preferred experience story. */
  narrativeOrder?: number;
  architecture?: ProjectArchitecture;
  readmeSynced?: string;
}

export interface SkillRecord {
  id: string;
  name: string;
  level: SkillLevel;
  summary?: string;
  projectIds: string[];
  evidenceIds: string[];
}

export interface SkillDetail extends SkillRecord {
  relatedProjects: Array<{
    id: string;
    title: string;
    summary: string;
    stack: string[];
  }>;
}

export interface EvidenceRecord {
  id: string;
  title: string;
  type: string;
  url?: string;
  supports: string;
  body: string;
  projectIds: string[];
  skillIds: string[];
  visibility: Visibility;
}

export interface StoryRecord {
  id: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  projectIds: string[];
  skillIds: string[];
  visibility: Visibility;
}

export interface KnowledgeIndex {
  profile: ProfileRecord | null;
  experience: ExperienceRecord[];
  projects: ProjectRecord[];
  skills: SkillRecord[];
  evidence: EvidenceRecord[];
  stories: StoryRecord[];
  loadedAt: string;
  rootPath: string;
}
