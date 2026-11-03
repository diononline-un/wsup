<script lang="ts">
  import '../app.css'
  import Logo from '$lib/Logo.svelte'
  import ThemeToggle from '$lib/ThemeToggle.svelte'
  import { pb } from '$lib/pocketbase'
  import { onMount } from 'svelte'

  let { children } = $props()
  let signedIn = $state(false)

  onMount(() => {
    signedIn = pb.authStore.isValid
    return pb.authStore.onChange(() => {
      signedIn = pb.authStore.isValid
    })
  })
</script>

<header class="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
  <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
    <a href="/" class="flex items-center gap-2.5 font-semibold text-slate-900 no-underline dark:text-slate-100">
      <Logo class="h-8 w-8" />
      <span class="flex flex-col leading-tight">
        <span class="text-base tracking-tight">WSUP</span>
        <span class="hidden text-[10px] font-normal uppercase tracking-wider text-slate-500 sm:block dark:text-slate-400">
          Supplement Stack Calculator
        </span>
      </span>
    </a>
    <nav class="flex items-center gap-2 text-sm sm:gap-3">
      {#if signedIn}
        <a
          href="/dashboard"
          class="rounded-lg px-3 py-2 text-slate-700 no-underline hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Dashboard
        </a>
        <a
          href="/settings"
          class="rounded-lg px-3 py-2 text-slate-700 no-underline hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Settings
        </a>
      {:else}
        <a
          href="/login"
          class="rounded-lg px-3 py-2 text-slate-700 no-underline hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Log in
        </a>
        <a
          href="/signup"
          class="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white no-underline hover:bg-slate-700 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
        >
          Start free
        </a>
      {/if}
      <ThemeToggle />
    </nav>
  </div>
</header>

<main class="flex-1">
  {@render children()}
</main>

<footer class="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
  <div class="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500 sm:px-6 dark:text-slate-400">
    <p class="max-w-3xl">
      <strong class="text-slate-700 dark:text-slate-200">Medical disclaimer:</strong> WSUP provides educational
      information, not medical advice. Supplements and peptides can interact with medication and medical conditions.
      Talk to a licensed clinician before changing anything, especially while pregnant, breastfeeding, under 18, or
      taking prescription drugs.
    </p>
    <p class="mt-4">
      © {new Date().getFullYear()} WSUP ·
      <a href="/signup" class="text-slate-600 dark:text-slate-300">Anonymous by design</a>
    </p>
  </div>
</footer>
