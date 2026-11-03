<script lang="ts">
  import { goto } from '$app/navigation'
  import { pb } from '$lib/pocketbase'
  import { onMount } from 'svelte'

  let ready = $state(false)
  let username = $state('')
  let tier = $state('basic')
  let recoveryVerified = $state(false)
  let profile = $state<Record<string, unknown> | null>(null)

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

    try {
      profile = (await pb
        .collection('user_profiles')
        .getFirstListItem(pb.filter('user = {:id}', { id: String(record.id) }))) as unknown as Record<string, unknown>
    } catch {
      profile = null
    }
    ready = true
  })

  function logout() {
    pb.authStore.clear()
    goto('/')
  }

  function metric(value: unknown, unit: string): string {
    return value == null ? '—' : `${value} ${unit}`
  }
</script>

<svelte:head>
  <title>Dashboard · WSUP</title>
</svelte:head>

<section class="mx-auto max-w-5xl px-4 py-12 sm:px-6">
  {#if !ready}
    <p class="ui-muted">Loading…</p>
  {:else}
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="ui-muted text-sm">Signed in anonymously</p>
        <h1 class="flex items-center gap-3 text-3xl font-bold tracking-tight">
          {username}
          <span
            class="rounded-full px-2.5 py-0.5 text-xs font-medium {tier === 'pro'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
              : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}"
          >
            {tier === 'pro' ? 'Pro' : 'Basic'}
          </span>
        </h1>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {#if recoveryVerified}
            Recovery seed verified
          {:else}
            Recovery seed not verified
          {/if}
        </p>
      </div>
      <button type="button" onclick={logout} class="ui-btn-secondary">Log out</button>
    </div>

    <div class="mt-10 grid gap-4 md:grid-cols-3">
      <a href="/onboarding/profile" class="ui-card p-5 no-underline hover:border-slate-300 dark:hover:border-slate-600">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-slate-900 dark:text-slate-100">Your profile</h2>
          <span
            class="rounded-full px-2 py-0.5 text-xs font-medium {profile
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'}"
          >
            {profile ? 'Complete' : 'Missing'}
          </span>
        </div>
        {#if profile}
          <dl class="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
            <dt class="ui-muted">Age</dt>
            <dd>{metric(profile.age, 'years')}</dd>
            <dt class="ui-muted">Height</dt>
            <dd>{metric(profile.height_cm, 'cm')}</dd>
            <dt class="ui-muted">Weight</dt>
            <dd>{metric(profile.weight_kg, 'kg')}</dd>
          </dl>
          <p class="mt-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">Edit profile →</p>
        {:else}
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Biometrics, sleep, medication and cycle data. Drives every recommendation and the confidence score.
          </p>
          <p class="mt-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">Next step: build your profile →</p>
        {/if}
      </a>

      <div class="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 dark:border-slate-700 dark:bg-slate-900/60">
        <h2 class="font-semibold text-slate-900 dark:text-slate-100">Your stack</h2>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Recommendations and your own entries with a matching score. Needs a completed profile first.
        </p>
        <p class="mt-3 text-xs font-medium ui-muted">Coming next</p>
      </div>

      <div class="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 dark:border-slate-700 dark:bg-slate-900/60">
        <h2 class="font-semibold text-slate-900 dark:text-slate-100">Calendar feed</h2>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Subscribe to your dosing schedule in any calendar app.
        </p>
        <p class="mt-3 text-xs font-medium ui-muted">{tier === 'pro' ? 'Pro: up to 3 feeds' : 'Basic: 1 feed'}</p>
      </div>
    </div>

    <p class="ui-muted mt-8 text-sm">
      Manage your account, export data or delete it in
      <a href="/settings" class="ui-link">Settings</a>.
    </p>
  {/if}
</section>
