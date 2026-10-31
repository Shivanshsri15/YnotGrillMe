/** Grill doneness / depth for chat and Project Drill. */
export enum GrillMode {
  WarmUp = 'warm_up',
  MediumRare = 'medium_rare',
  WellDone = 'well_done',
}

/**
 * Progressive answer chain:
 * - hook: one or two curiosity-driving lines (default for browsing)
 * - deep: short narrative + trade-offs when the visitor clicks to expand
 */
export enum AnswerDepth {
  Hook = 'hook',
  Deep = 'deep',
}

/**
 * How experience should be narrated / ranked in retrieval and suggestions.
 * Tell stories in this order unless the visitor asks about something else.
 */
export enum ExperiencePillar {
  Ai = 'ai',
  Backend = 'backend',
  Platform = 'platform',
}

/** First-screen visitor persona for role-aware entry. */
export enum VisitorRole {
  Hiring = 'hiring',
  Engineer = 'engineer',
  Exploring = 'exploring',
}

/** Resume PDF / retrieval variants. */
export enum ResumeVariant {
  Generic = 'generic',
  Backend = 'backend',
  Ai = 'ai',
}

/** Explanation audience overlay (orthogonal to GrillMode). */
export enum Audience {
  Recruiter = 'recruiter',
  Junior = 'junior',
  Senior = 'senior',
}

/** Grill follow-up actions the UI can trigger. */
export enum GrillAction {
  GoDeeper = 'go_deeper',
  ExplainSimply = 'explain_simply',
  WhatCouldGoWrong = 'what_could_go_wrong',
  ChallengeThis = 'challenge_this',
  ShowReceipts = 'show_receipts',
}

/** Content visibility for public API filtering. */
export enum Visibility {
  Public = 'public',
  Private = 'private',
}

/** How a skill was used. */
export enum SkillLevel {
  Production = 'production',
  Project = 'project',
  Learning = 'learning',
}
