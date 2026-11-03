import { error } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import type { PageServerLoad } from './$types'

const base = () => env.POCKETBASE_URL || 'http://127.0.0.1:2017'

export const load: PageServerLoad = async ({ params, fetch }) => {
  const filter = encodeURIComponent(`slug = "${params.slug}"`)
  const substanceResponse = await fetch(`${base()}/api/collections/substances/records?perPage=1&filter=${filter}`)
  if (!substanceResponse.ok) error(503, 'Research library is unavailable.')
  const substances = (await substanceResponse.json()).items
  if (!substances.length) error(404, 'Substance not found.')
  const substance = substances[0]

  const [evidenceResponse, interactionsResponse] = await Promise.all([
    fetch(
      `${base()}/api/collections/substance_evidence/records?perPage=50&sort=-year&filter=${encodeURIComponent(`substance = "${substance.id}"`)}`,
    ),
    fetch(`${base()}/api/collections/substance_interactions/records?perPage=200&expand=substance_a,substance_b`),
  ])
  if (!evidenceResponse.ok || !interactionsResponse.ok) error(503, 'Research library is unavailable.')

  const evidence = (await evidenceResponse.json()).items
  const interactions = (await interactionsResponse.json()).items.filter(
    (item: { substance_a: string; substance_b: string }) =>
      item.substance_a === substance.id || item.substance_b === substance.id,
  )

  return { substance, evidence, interactions }
}
