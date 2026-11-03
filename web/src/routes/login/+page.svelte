<script lang="ts">
  import { goto } from '$app/navigation'
  import { normalizeUsername } from '$lib/credentials'
  import { pb } from '$lib/pocketbase'

  let username = $state('')
  let password = $state('')
  let error = $state('')
  let busy = $state(false)

  async function submit(event: SubmitEvent) {
    event.preventDefault()
    error = ''
    busy = true
    try {
      await pb.collection('users').authWithPassword(normalizeUsername(username), password)
      await goto('/dashboard')
    } catch {
      error = 'Wrong username or password.'
    } finally {
      busy = false
    }
  }
</script>

<svelte:head>
  <title>Log in · WSUP</title>
</svelte:head>

<section class="mx-auto max-w-md px-4 py-16 sm:px-6">
  <h1 class="text-3xl font-bold tracking-tight">Welcome back</h1>
  <p class="mt-3 text-slate-600 dark:text-slate-300">
    Usernames are case-insensitive, so just type the name you registered.
  </p>

  {#if error}
    <div role="alert" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
      {error}
    </div>
  {/if}

  <form class="mt-8 space-y-5" onsubmit={submit}>
    <div>
      <label for="username" class="ui-label">Username</label>
      <input id="username" name="username" autocomplete="username" required bind:value={username} class="ui-input" />
    </div>
    <div>
      <label for="password" class="ui-label">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autocomplete="current-password"
        required
        bind:value={password}
        class="ui-input"
      />
    </div>
    <button type="submit" disabled={busy} class="ui-btn-primary w-full">
      {busy ? 'Signing in…' : 'Log in'}
    </button>
  </form>

  <p class="ui-muted mt-6 text-sm">
    Lost your password? Account recovery with your 25-word seed is not built yet.
    <a href="/signup" class="ui-link">Create a new account</a> in the meantime.
  </p>
</section>
