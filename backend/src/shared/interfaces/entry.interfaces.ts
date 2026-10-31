import type { GrillMode, ResumeVariant, VisitorRole } from '../enums.ts';

/** Role-aware landing preset returned by GET /entry/:role (Phase 1). */
export interface EntryPreset {
  role: VisitorRole;
  defaultGrillMode: GrillMode;
  resumeVariant: ResumeVariant;
  suggestedRoutes: string[];
}
