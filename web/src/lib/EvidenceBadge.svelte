<script lang="ts">
  import { levelClass, LEVEL_MEANING, type EvidenceLevel } from '$lib/research'

  let { level }: { level: string } = $props()
</script>

<span
  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {levelClass(level)}"
  title={LEVEL_MEANING[level as EvidenceLevel] ?? 'Evidence level'}
>
  Evidence {level}
</span>
