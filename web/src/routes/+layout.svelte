<script lang="ts">
  import '../app.css'
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

<header class="border-b border-slate-200 bg-white/80 backdrop-blur">
  <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
    <a href="/" class="flex items-center gap-2 font-semibold text-slate-900 no-underline">
      <span class="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-sm font-bold text-emerald-400">S</span>
      Stack Calculator
    </a>
    <nav class="flex items-center gap-3 text-sm">
      {#if signedIn}
        <a href="/dashboard" class="rounded-lg px-3 py-2 text-slate-700 no-underline hover:bg-slate-100">Dashboard</a>
      {:else}
        <a href="/login" class="rounded-lg px-3 py-2 text-slate-700 no-underline hover:bg-slate-100">Log in</a>
        <a
          href="/signup"
          class="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white no-underline hover:bg-slate-700"
        >
          Start free
        </a>
      {/if}
    </nav>
  </div>
</header>

<main class="flex-1">
  {@render children()}
</main>

<footer class="border-t border-slate-200 bg-white">
  <div class="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500 sm:px-6">
    <p class="max-w-3xl">
      <strong class="text-slate-700">Medical disclaimer:</strong> Stack Calculator provides educational information, not
      medical advice. Supplements and peptides can interact with medication and medical conditions. Talk to a licensed
      clinician before changing anything, especially while pregnant, breastfeeding, under 18, or taking prescription drugs.
    </p>
    <p class="mt-4">© {new Date().getFullYear()} Stack Calculator · <a href="/signup" class="text-slate-600">Anonymous by design</a></p>
  </div>
</footer>
