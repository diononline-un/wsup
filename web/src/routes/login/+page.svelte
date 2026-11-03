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
  <title>Log in · Stack Calculator</title>
</svelte:head>

<section class="mx-auto max-w-md px-4 py-16 sm:px-6">
  <h1 class="text-3xl font-bold tracking-tight">Welcome back</h1>
  <p class="mt-3 text-slate-600">Usernames are case-insensitive, so just type the name you registered.</p>

  {#if error}
    <div role="alert" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {error}
    </div>
  {/if}

  <form class="mt-8 space-y-5" onsubmit={submit}>
    <div>
      <label for="username" class="block text-sm font-medium">Username</label>
      <input
        id="username"
        name="username"
        autocomplete="username"
        required
        bind:value={username}
        class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
      />
    </div>
    <div>
      <label for="password" class="block text-sm font-medium">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autocomplete="current-password"
        required
        bind:value={password}
        class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
      />
    </div>
    <button
      type="submit"
      disabled={busy}
      class="w-full rounded-xl bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-700 disabled:opacity-50"
    >
      {busy ? 'Signing in…' : 'Log in'}
    </button>
  </form>

  <p class="mt-6 text-sm text-slate-500">
    Lost your password? Account recovery with your 25-word seed is not built yet.
    <a href="/signup" class="text-slate-700">Create a new account</a> in the meantime.
  </p>
</section>
