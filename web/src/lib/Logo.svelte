<script lang="ts">
  let { class: className = 'h-8 w-8' } = $props()
</script>

<svg viewBox="0 0 32 32" class={className} role="img" aria-label="WSUP logo">
  <rect width="32" height="32" rx="8" class="fill-slate-900 dark:fill-emerald-500" />
  <g class="fill-emerald-400 dark:fill-slate-950">
    <rect x="8" y="7" width="16" height="4" rx="2" />
    <rect x="5" y="14" width="22" height="4" rx="2" />
    <rect x="9" y="21" width="14" height="4" rx="2" />
  </g>
</svg>
