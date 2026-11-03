<script lang="ts">
  import EvidenceBadge from '$lib/EvidenceBadge.svelte'
  import { LEVEL_MEANING } from '$lib/research'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const categoryLabels: Record<string, string> = {
    vitamin: 'Vitamins',
    mineral: 'Minerals',
    amino_acid: 'Amino acids & protein',
    fatty_acid: 'Fatty acids',
    adaptogen: 'Adaptogens',
    peptide: 'Peptides',
    other: 'Other',
  }
  const categoryOrder = ['vitamin', 'mineral', 'fatty_acid', 'amino_acid', 'adaptogen', 'peptide', 'other']

  const groups = $derived(
    categoryOrder
      .map((category) => ({
        category,
        label: categoryLabels[category],
        items: data.substances
          .filter((substance) => substance.category === category)
          .sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .filter((group) => group.items.length > 0),
  )
</script>

<svelte:head>
  <title>Evidence library · WSUP</title>
  <meta name="description" content="How strong the evidence is for each substance: trial data, animal models, open questions." />
</svelte:head>

<section class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
  <h1 class="text-3xl font-bold tracking-tight">Evidence library</h1>
  <p class="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
    Every substance in WSUP carries a research grade and the papers behind it. Claims are paraphrases, sources are
    peer-reviewed papers, and each claim keeps its own evidence level. Where human data is thin, the page says so.
  </p>
  <dl class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
    {#each ['A', 'B', 'C', 'D', 'E'] as level}
      <div class="flex items-center gap-2">
        <EvidenceBadge {level} />
        <dd>{LEVEL_MEANING[level as 'A' | 'B' | 'C' | 'D' | 'E']}</dd>
      </div>
    {/each}
  </dl>

  {#each groups as group}
    <section class="mt-10">
      <h2 class="text-xl font-semibold tracking-tight">{group.label}</h2>
      <div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each group.items as substance}
          <a href={`/evidence/${substance.slug}`} class="ui-card block p-5 no-underline hover:border-slate-300 dark:hover:border-slate-600">
            <div class="flex items-start justify-between gap-3">
              <h3 class="font-semibold text-slate-900 dark:text-slate-100">{substance.name}</h3>
              <EvidenceBadge level={substance.evidence_level ?? 'C'} />
            </div>
            <p class="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{substance.research_summary}</p>
            <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {substance.sources} sources · {substance.tier_required === 'pro' ? 'Pro' : 'Basic'} tier
            </p>
          </a>
        {/each}
      </div>
    </section>
  {/each}

  <p class="mt-10 text-xs text-slate-500 dark:text-slate-400">
    Research grades describe the state of the literature, not a recommendation for you. See the
    <a href="/" class="ui-link">medical disclaimer</a>.
  </p>
</section>
