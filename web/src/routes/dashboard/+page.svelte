<script lang="ts">
  import { goto } from '$app/navigation'
  import { pb } from '$lib/pocketbase'
  import { onMount } from 'svelte'

  let ready = $state(false)
  let username = $state('')
  let tier = $state('basic')
  let recoveryVerified = $state(false)

  onMount(async () => {
    if (!pb.authStore.isValid) {
      await goto('/login')
      return
    }
    try {
      // refresh so plan changes (tier) show without a new login
      await pb.collection('users').authRefresh()
    } catch {
      pb.authStore.clear()
      await goto('/login')
      return
    }
    const record = pb.authStore.record as Record<string, unknown>
    username = String(record.username ?? '')
    tier = String(record.tier ?? 'basic')
    recoveryVerified = Boolean(record.recovery_verified)
    ready = true
  })

  function logout() {
    pb.authStore.clear()
    goto('/')
  }
</script>

<svelte:head>
  <title>Dashboard · Stack Calculator</title>
</svelte:head>

<section class="mx-auto max-w-5xl px-4 py-12 sm:px-6">
  {#if !ready}
    <p class="text-slate-500">Loading…</p>
  {:else}
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-sm text-slate-500">Signed in anonymously</p>
        <h1 class="text-3xl font-bold tracking-tight">{username}</h1>
        <p class="mt-1 text-sm text-slate-600">
          Tier: <span class="font-medium capitalize">{tier}</span>
          {#if recoveryVerified}
            · Recovery seed verified
          {/if}
        </p>
      </div>
      <button
        type="button"
        onclick={logout}
        class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
      >
        Log out
      </button>
    </div>

    <div class="mt-10 grid gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 class="font-semibold text-slate-900">Build your profile</h2>
        <p class="mt-1 text-sm text-slate-600">Biometrics, sleep, medication and cycle data. Drives the confidence score.</p>
        <p class="mt-4 text-xs font-medium text-emerald-700">Next step</p>
      </div>
      <div class="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5">
        <h2 class="font-semibold text-slate-900">Your stack</h2>
        <p class="mt-1 text-sm text-slate-600">Recommendations and your own entries with a matching score.</p>
        <p class="mt-4 text-xs font-medium text-slate-400">Needs a completed profile</p>
      </div>
      <div class="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5">
        <h2 class="font-semibold text-slate-900">Calendar feed</h2>
        <p class="mt-1 text-sm text-slate-600">Subscribe to your dosing schedule in any calendar app.</p>
        <p class="mt-4 text-xs font-medium text-slate-400">Basic: 1 feed · Pro: 3 feeds</p>
      </div>
    </div>
  {/if}
</section>
