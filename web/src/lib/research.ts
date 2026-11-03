export type EvidenceLevel = 'A' | 'B' | 'C' | 'D' | 'E'

export const LEVEL_ORDER: EvidenceLevel[] = ['A', 'B', 'C', 'D', 'E']

export const LEVEL_MEANING: Record<EvidenceLevel, string> = {
  A: 'Strong human evidence from multiple randomized trials or meta-analyses',
  B: 'Moderate evidence: at least one good trial or consistent observational data',
  C: 'Limited evidence: small trials, animal data or mixed results',
  D: 'Weak evidence: mainly preclinical or indirect data',
  E: 'Contradicted or no meaningful evidence',
}

export function levelClass(level: string | undefined): string {
  switch (level) {
    case 'A':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
    case 'B':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200'
    case 'C':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    case 'D':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    case 'E':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
    default:
      return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }
}

export function statusClass(status: string | undefined): string {
  switch (status) {
    case 'established':
      return 'text-emerald-700 dark:text-emerald-400'
    case 'plausible':
      return 'text-sky-700 dark:text-sky-400'
    case 'speculative':
      return 'text-amber-700 dark:text-amber-400'
    case 'refuted':
      return 'text-rose-700 dark:text-rose-400'
    default:
      return 'text-slate-600 dark:text-slate-400'
  }
}

export function kindLabel(kind: string | undefined): string {
  const labels: Record<string, string> = {
    rct: 'RCT',
    meta: 'Meta-analysis',
    review: 'Review',
    preclinical: 'Animal / preclinical',
    'in-vitro': 'In vitro',
    case: 'Case report',
    guideline: 'Guideline',
    regulatory: 'Regulatory',
    database: 'Database',
    other: 'Other',
  }
  return labels[kind ?? ''] ?? 'Source'
}
