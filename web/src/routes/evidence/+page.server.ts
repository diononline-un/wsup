import { error } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import type { PageServerLoad } from './$types'

const base = () => env.POCKETBASE_URL || 'http://127.0.0.1:2017'

export const load: PageServerLoad = async ({ fetch }) => {
  const [substancesResponse, evidenceResponse] = await Promise.all([
    fetch(`${base()}/api/collections/substances/records?perPage=200&filter=${encodeURIComponent("active = true")}`),
    fetch(`${base()}/api/collections/substance_evidence/records?perPage=500&fields=substance`),
  ])
  if (!substancesResponse.ok || !evidenceResponse.ok) error(503, 'Research library is unavailable.')

  const substances = (await substancesResponse.json()).items
  const evidence = (await evidenceResponse.json()).items as { substance: string }[]
  const counts = new Map<string, number>()
  for (const source of evidence) counts.set(source.substance, (counts.get(source.substance) ?? 0) + 1)

  return {
    substances: substances.map((substance: Record<string, unknown>) => ({
      id: substance.id,
      slug: substance.slug,
      name: substance.name,
      category: substance.category,
      evidence_level: substance.evidence_level,
      research_summary: substance.research_summary,
      tier_required: substance.tier_required,
      sources: counts.get(String(substance.id)) ?? 0,
    })),
  }
}
