import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { KnowledgeService } from '../knowledge/knowledge.service.ts';
import { ResumeVariant } from '../shared/enums.ts';

export interface ResumeListItem {
  variant: ResumeVariant;
  format: 'markdown' | 'pdf';
  fileName: string;
  bytes: number;
}

export interface ResumeFile {
  variant: ResumeVariant;
  fileName: string;
  contentType: string;
  buffer: Buffer;
}

const VARIANT_BASE: Record<ResumeVariant, string> = {
  [ResumeVariant.Generic]: 'generic',
  [ResumeVariant.Backend]: 'backend',
  [ResumeVariant.Ai]: 'ai',
};

@Injectable()
export class ResumeService {
  constructor(private readonly knowledge: KnowledgeService) {}

  list(): ResumeListItem[] {
    const dir = this.resumeDir();
    if (!existsSync(dir)) {
      return [];
    }

    const items: ResumeListItem[] = [];
    for (const variant of Object.values(ResumeVariant)) {
      const resolved = this.resolvePath(variant);
      if (!resolved) continue;
      const stats = statSync(resolved.path);
      items.push({
        variant,
        format: resolved.format,
        fileName: resolved.fileName,
        bytes: stats.size,
      });
    }
    return items;
  }

  getFile(variant: ResumeVariant): ResumeFile {
    const resolved = this.resolvePath(variant);
    if (!resolved) {
      throw new NotFoundException(`Resume variant "${variant}" not found`);
    }
    return {
      variant,
      fileName: resolved.fileName,
      contentType: resolved.contentType,
      buffer: readFileSync(resolved.path),
    };
  }

  /** Discover variants present on disk (including unexpected extensions). */
  availableFileNames(): string[] {
    const dir = this.resumeDir();
    if (!existsSync(dir)) return [];
    return readdirSync(dir).filter((name) => !name.startsWith('.'));
  }

  private resolvePath(variant: ResumeVariant): {
    path: string;
    fileName: string;
    format: 'markdown' | 'pdf';
    contentType: string;
  } | null {
    const dir = this.resumeDir();
    const base = VARIANT_BASE[variant];
    const pdfName = `${base}.pdf`;
    const mdName = `${base}.md`;
    const pdfPath = join(dir, pdfName);
    const mdPath = join(dir, mdName);

    if (existsSync(pdfPath)) {
      return {
        path: pdfPath,
        fileName: pdfName,
        format: 'pdf',
        contentType: 'application/pdf',
      };
    }
    if (existsSync(mdPath)) {
      return {
        path: mdPath,
        fileName: mdName,
        format: 'markdown',
        contentType: 'text/markdown; charset=utf-8',
      };
    }
    return null;
  }

  private resumeDir(): string {
    return join(this.knowledge.getRootPath(), 'resume');
  }
}
