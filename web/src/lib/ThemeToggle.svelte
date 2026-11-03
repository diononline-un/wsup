<script lang="ts">
  import { applyTheme, prefersDark, readTheme, type Theme } from '$lib/theme'
  import { onMount } from 'svelte'

  let theme = $state<Theme>('system')
  let systemDark = $state(false)

  onMount(() => {
    theme = readTheme()
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    systemDark = media.matches
    const onChange = () => {
      systemDark = media.matches
      applyTheme(theme)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  })

  const labels: Record<Theme, string> = { system: 'System', light: 'Light', dark: 'Dark' }

  function toggle() {
    // one click must visibly switch mode; system stays the default until then
    theme = prefersDark(theme, systemDark) ? 'light' : 'dark'
    applyTheme(theme)
  }
</script>

<button
  type="button"
  onclick={toggle}
  class="rounded-lg border border-slate-300 px-2.5 py-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
  aria-label="Theme: {labels[theme]}. Switch to {prefersDark(theme, systemDark) ? 'Light' : 'Dark'}."
  title="Theme: {labels[theme]}"
>
  {#if theme === 'system'}
    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" stroke-linecap="round" />
    </svg>
  {:else if theme === 'light'}
    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" stroke-linecap="round" />
    </svg>
  {:else}
    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a8.5 8.5 0 1 0 11.5 11.5Z" stroke-linejoin="round" />
    </svg>
  {/if}
</button>
