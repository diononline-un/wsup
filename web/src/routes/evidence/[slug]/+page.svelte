<script lang="ts">
  import EvidenceBadge from '$lib/EvidenceBadge.svelte'
  import { kindLabel, statusClass } from '$lib/research'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()

  const categoryLabels: Record<string, string> = {
    vitamin: 'Vitamin',
    mineral: 'Mineral',
    amino_acid: 'Amino acid / protein',
    peptide: 'Peptide',
    fatty_acid: 'Fatty acid',
    adaptogen: 'Adaptogen',
    medication: 'Medication',
    other: 'Other',
  }

  const severityClass: Record<string, string> = {
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    caution: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  }

  function otherName(interaction: Record<string, unknown>): { name: string; slug?: string } {
    const substance = data.substance
    const a = interaction.expand?.substance_a
    const b = interaction.expand?.substance_b
    const other = interaction.substance_a === substance.id ? b : a
    return { name: other?.name ?? 'Unknown', slug: other?.slug }
  }
</script>

<svelte:head>
  <title>{data.substance.name} · Evidence · WSUP</title>
  <meta name="description" content={data.substance.research_summary ?? `Evidence overview for ${data.substance.name}`} />
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
  <a href="/evidence" class="text-sm text-slate-600 no-underline hover:underline dark:text-slate-300">← Evidence library</a>

  <div class="mt-4 flex flex-wrap items-center gap-3">
    <h1 class="text-3xl font-bold tracking-tight">{data.substance.name}</h1>
    <EvidenceBadge level={data.substance.evidence_level ?? 'C'} />
    <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      {categoryLabels[data.substance.category] ?? 'Substance'}
    </span>
  </div>
  <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{data.substance.description}</p>

  <dl class="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
    <div>
      <dt class="text-slate-500 dark:text-slate-400">Typical studied dose</dt>
      <dd class="font-medium">{data.substance.typical_dose ?? '—'}</dd>
    </div>
    <div>
      <dt class="text-slate-500 dark:text-slate-400">Timing used in research</dt>
      <dd class="font-medium">{data.substance.timing ?? '—'}</dd>
    </div>
    <div>
      <dt class="text-slate-500 dark:text-slate-400">Tier</dt>
      <dd class="font-medium capitalize">{data.substance.tier_required ?? 'basic'}</dd>
    </div>
    <div>
      <dt class="text-slate-500 dark:text-slate-400">Sources on this page</dt>
      <dd class="font-medium">{data.evidence.length}</dd>
    </div>
  </dl>

  <div class="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm dark:border-slate-800 dark:bg-slate-900">
    <p class="font-medium">Why this grade?</p>
    <p class="mt-1 text-slate-600 dark:text-slate-300">{data.substance.evidence_note ?? 'No rationale recorded.'}</p>
  </div>

  <section class="mt-8">
    <h2 class="text-xl font-semibold tracking-tight">Research summary</h2>
    <p class="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">{data.substance.research_summary}</p>
  </section>

  {#if data.substance.claims?.length}
    <section class="mt-8">
      <h2 class="text-xl font-semibold tracking-tight">What the research shows</h2>
      <ul class="mt-3 space-y-3">
        {#each data.substance.claims as claim}
          <li class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div class="flex flex-wrap items-center gap-2">
              <EvidenceBadge level={claim.level} />
              <span class="text-xs font-medium capitalize {statusClass(claim.status)}">{claim.status}</span>
            </div>
            <p class="mt-2 text-sm text-slate-700 dark:text-slate-200">{claim.text}</p>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <section class="mt-8">
    <h2 class="text-xl font-semibold tracking-tight">Sources</h2>
    <ol class="mt-3 space-y-3">
      {#each data.evidence as source}
        <li class="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
          <a href={source.url} rel="noopener noreferrer" target="_blank" class="font-medium ui-link">{source.title}</a>
          <p class="mt-1 text-slate-600 dark:text-slate-300">
            {source.authors}{source.authors ? ' · ' : ''}{source.venue}{source.venue ? ', ' : ''}{source.year}
          </p>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {kindLabel(source.kind)}{source.pmid ? ` · PMID ${source.pmid}` : ''}{source.doi ? ` · DOI ${source.doi}` : ''}
          </p>
        </li>
      {/each}
    </ol>
  </section>

  {#if data.interactions.length}
    <section class="mt-8">
      <h2 class="text-xl font-semibold tracking-tight">Known interactions</h2>
      <ul class="mt-3 space-y-3">
        {#each data.interactions as interaction}
          {@const other = otherName(interaction)}
          <li class="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-full px-2 py-0.5 text-xs font-medium {severityClass[interaction.severity] ?? ''}">
                {interaction.severity}
              </span>
              <span class="font-medium">
                with
                {#if other.slug}
                  <a href={`/evidence/${other.slug}`} class="ui-link">{other.name}</a>
                {:else}
                  {other.name}
                {/if}
              </span>
            </div>
            <p class="mt-2 text-slate-600 dark:text-slate-300">{interaction.mechanism}</p>
            <p class="mt-1 text-slate-500 dark:text-slate-400">{interaction.recommendation}</p>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <div class="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
    <p class="font-medium">Not medical advice.</p>
    <p class="mt-1">
      Research grades describe how good the evidence is, not whether a substance is right for you. Peptide entries
      are research chemicals without marketing authorisation in the EU or US unless stated otherwise.
    </p>
  </div>

  <div class="mt-8 flex flex-wrap gap-3">
    <a href="/signup" class="ui-btn-primary no-underline">Build a stack with this</a>
    <a href="/evidence" class="ui-btn-secondary px-5 py-3 no-underline">Back to library</a>
  </div>
</section>
