export type DonenessId = 'warm_up' | 'medium_rare' | 'well_done'

export interface DonenessOption {
  id: DonenessId
  label: string
  heat: number
  blurb: string
}

export const DONENESS: DonenessOption[] = [
  {
    id: 'warm_up',
    label: 'Warm-up',
    heat: 32,
    blurb: 'Hook-length answers. Map the work. Click to go deeper.',
  },
  {
    id: 'medium_rare',
    label: 'Medium rare',
    heat: 64,
    blurb: 'APIs, data shape, and the main trade-off on the table.',
  },
  {
    id: 'well_done',
    label: 'Well done',
    heat: 100,
    blurb: 'Edge cases, failure modes, and what you should not claim.',
  },
]

export const SAMPLE_TURNS = [
  {
    role: 'you' as const,
    text: 'What did you build at Venwiz?',
  },
  {
    role: 'engineer' as const,
    text: 'At Venwiz I worked across an AI expediting layer, a status engine that killed five-server drift, and an offline-first mobile sync stack — in that order.',
  },
]

export const PROJECTS = [
  {
    id: 'workspace-insights-hawkai',
    title: 'HawkAI',
    tag: 'AI',
    line: 'Deterministic signals. LLM synthesis. Ranked alerts.',
  },
  {
    id: 'status-engine',
    title: 'statusData v2',
    tag: 'Backend',
    line: 'One IST-pinned engine. Five servers. Zero status drift.',
  },
  {
    id: 'offline-first-mobile',
    title: 'Offline sync',
    tag: 'Platform',
    line: 'Queue writes. Survive the field. Reconcile on reconnect.',
  },
  {
    id: 'precision',
    title: 'PReCision',
    tag: 'AI',
    line: 'Repo-aware PR review — past the diff.',
  },
]

export const LEAVE_WITH = [
  {
    title: 'Receipts',
    line: 'Every claim can point at evidence — repos, demos, write-ups.',
  },
  {
    title: 'Honest JD match',
    line: 'Paste a job description. Get overlaps, gaps, and do-not-claim.',
  },
  {
    title: 'The right resume',
    line: 'Generic, backend, or AI — served as-is, no generated fluff.',
  },
]
