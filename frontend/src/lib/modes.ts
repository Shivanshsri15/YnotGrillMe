import type { GrillMode, VisitorRole } from './types'

export const HEAT_MODES: Array<{
  id: GrillMode
  label: string
  hint: string
  heat: number
}> = [
  {
    id: 'warm_up',
    label: 'Warm-up',
    hint: 'Short & friendly',
    heat: 1,
  },
  {
    id: 'medium_rare',
    label: 'Medium',
    hint: 'Trade-offs & depth',
    heat: 2,
  },
  {
    id: 'well_done',
    label: 'Well done',
    hint: 'Hard grill mode',
    heat: 3,
  },
]

export const ROLE_OPTIONS: Array<{
  id: VisitorRole
  label: string
  line: string
}> = [
  { id: 'hiring', label: 'Hiring', line: 'Outcomes and receipts.' },
  { id: 'engineer', label: 'Engineer', line: 'Architecture and trade-offs.' },
  { id: 'exploring', label: 'Exploring', line: 'Ask whatever you want.' },
]
