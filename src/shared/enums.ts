/** Grill doneness / depth for chat and Project Drill. */
export enum GrillMode {
  WarmUp = 'warm_up',
  MediumRare = 'medium_rare',
  WellDone = 'well_done',
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
