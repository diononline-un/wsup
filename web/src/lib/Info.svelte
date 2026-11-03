<script lang="ts">
  let { text, label = 'Why we ask this' }: { text: string; label?: string } = $props()
  let open = $state(false)
</script>

<span class="relative inline-flex align-middle">
  <button
    type="button"
    onclick={() => (open = !open)}
    aria-label={label}
    aria-expanded={open}
    class="ml-1 grid h-4 w-4 place-items-center rounded-full border border-slate-400 text-[10px] font-semibold leading-none text-slate-500 hover:border-slate-600 hover:text-slate-700 dark:border-slate-600 dark:text-slate-400 dark:hover:border-slate-400 dark:hover:text-slate-200"
  >
    i
  </button>
  {#if open}
    <span
      role="tooltip"
      class="absolute left-0 top-6 z-20 w-64 rounded-lg border border-slate-200 bg-white p-3 text-xs font-normal leading-relaxed text-slate-600 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
    >
      {text}
    </span>
  {/if}
</span>
