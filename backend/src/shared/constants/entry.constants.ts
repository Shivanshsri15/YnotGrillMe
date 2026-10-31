import { GrillMode, ResumeVariant, VisitorRole } from '../enums.ts';
import type { EntryPreset } from '../interfaces/entry.interfaces.ts';

export const ENTRY_PRESETS: Record<VisitorRole, EntryPreset> = {
  [VisitorRole.Hiring]: {
    role: VisitorRole.Hiring,
    defaultGrillMode: GrillMode.WarmUp,
    resumeVariant: ResumeVariant.Generic,
    suggestedRoutes: ['/jobs', '/resumes', '/projects'],
  },
  [VisitorRole.Engineer]: {
    role: VisitorRole.Engineer,
    defaultGrillMode: GrillMode.MediumRare,
    resumeVariant: ResumeVariant.Backend,
    suggestedRoutes: ['/projects', '/grill', '/skills'],
  },
  [VisitorRole.Exploring]: {
    role: VisitorRole.Exploring,
    defaultGrillMode: GrillMode.WarmUp,
    resumeVariant: ResumeVariant.Generic,
    suggestedRoutes: ['/chat', '/stories', '/projects'],
  },
};
