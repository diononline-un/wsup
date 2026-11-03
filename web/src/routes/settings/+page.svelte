<script lang="ts">
  import { goto } from '$app/navigation'
  import { applyTheme, readTheme, type Theme } from '$lib/theme'
  import { pb } from '$lib/pocketbase'
  import { onMount } from 'svelte'

  let ready = $state(false)
  let username = $state('')
  let tier = $state('basic')
  let created = $state('')
  let recoveryVerified = $state(false)
  let theme = $state<Theme>('system')
  let exportBusy = $state(false)
  let deletePassword = $state('')
  let deleteConfirmed = $state(false)
  let deleteBusy = $state(false)
  let error = $state('')
  let message = $state('')

  onMount(async () => {
    theme = readTheme()
    if (!pb.authStore.isValid) {
      await goto('/login')
      return
    }
    try {
      await pb.collection('users').authRefresh()
    } catch {
      pb.authStore.clear()
      await goto('/login')
      return
    }
    const record = pb.authStore.record as Record<string, unknown>
    username = String(record.username ?? '')
    tier = String(record.tier ?? 'basic')
    created = record.created ? new Date(String(record.created)).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '—'
    recoveryVerified = Boolean(record.recovery_verified)
    ready = true
  })

  function setTheme(next: Theme) {
    theme = next
    applyTheme(next)
  }

  const themes: { value: Theme; label: string; hint: string }[] = [
    { value: 'system', label: 'System', hint: 'Follows your OS setting' },
    { value: 'light', label: 'Light', hint: 'Always light' },
    { value: 'dark', label: 'Dark', hint: 'Always dark' },
  ]

  function downloadJson(filename: string, content: string) {
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function exportData() {
    error = ''
    message = ''
    exportBusy = true
    try {
      const response = await fetch('/api/account/export', {
        headers: { authorization: `Bearer ${pb.authStore.token}` },
      })
      if (!response.ok) {
        error = 'Export failed. Log in again and retry.'
        return
      }
      const disposition = response.headers.get('content-disposition') ?? ''
      const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? 'wsup-export.json'
      downloadJson(filename, await response.text())
      message = 'Export downloaded.'
    } catch {
      error = 'Export failed. Try again.'
    } finally {
      exportBusy = false
    }
  }

  async function deleteAccount(event: SubmitEvent) {
    event.preventDefault()
    error = ''
    message = ''
    if (!deleteConfirmed) {
      error = 'Tick the confirmation box first.'
      return
    }
    if (!deletePassword) {
      error = 'Enter your password to delete the account.'
      return
    }
    deleteBusy = true
    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${pb.authStore.token}` },
        body: JSON.stringify({ password: deletePassword }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        error = data.message ?? 'Account was not deleted.'
        return
      }
      pb.authStore.clear()
      await goto('/')
    } catch {
      error = 'Account was not deleted. Try again.'
    } finally {
      deleteBusy = false
    }
  }
</script>

<svelte:head>
  <title>Settings · WSUP</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
  <h1 class="text-3xl font-bold tracking-tight">Settings</h1>

  {#if error}
    <div role="alert" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
      {error}
    </div>
  {/if}
  {#if message}
    <div role="status" class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
      {message}
    </div>
  {/if}

  {#if !ready}
    <p class="ui-muted mt-8">Loading…</p>
  {:else}
    <div class="mt-8 space-y-6">
      <div class="ui-card p-5">
        <h2 class="ui-section-title">Account</h2>
        <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt class="ui-muted">Username</dt>
            <dd class="font-medium">{username}</dd>
          </div>
          <div>
            <dt class="ui-muted">Tier</dt>
            <dd class="font-medium uppercase">{tier}</dd>
          </div>
          <div>
            <dt class="ui-muted">Member since</dt>
            <dd class="font-medium">{created}</dd>
          </div>
          <div>
            <dt class="ui-muted">Recovery</dt>
            <dd class="font-medium">{recoveryVerified ? '25-word seed verified' : 'Not verified'}</dd>
          </div>
        </dl>
      </div>

      <div class="ui-card p-5">
        <h2 class="ui-section-title">Appearance</h2>
        <p class="ui-hint">System follows your operating system. The choice is stored in this browser.</p>
        <div class="mt-3 grid gap-2 sm:grid-cols-3">
          {#each themes as option}
            <button
              type="button"
              onclick={() => setTheme(option.value)}
              class="rounded-xl border px-4 py-3 text-left {theme === option.value
                ? 'border-slate-900 bg-slate-50 dark:border-emerald-500 dark:bg-slate-800'
                : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'}"
            >
              <span class="block text-sm font-medium">{option.label}</span>
              <span class="ui-hint">{option.hint}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="ui-card p-5">
        <h2 class="ui-section-title">Your data</h2>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Download everything we store for your account: profile, stacks and calendar feeds. The recovery seed is
          stored only as a one-way hash and cannot be exported — keep your `.txt` file.
        </p>
        <button type="button" onclick={exportData} disabled={exportBusy} class="ui-btn-secondary mt-4">
          {exportBusy ? 'Preparing export…' : 'Download my data (JSON)'}
        </button>
      </div>

      <div class="rounded-2xl border border-red-200 bg-white p-5 dark:border-red-900 dark:bg-slate-900">
        <h2 class="ui-section-title text-red-700 dark:text-red-300">Delete account</h2>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          This removes the account, profile, stacks and calendar feeds. It cannot be undone. Download your data first.
        </p>
        <form class="mt-4 space-y-3" onsubmit={deleteAccount}>
          <div>
            <label for="delete-password" class="ui-label">Password</label>
            <input
              id="delete-password"
              type="password"
              autocomplete="current-password"
              bind:value={deletePassword}
              class="ui-input"
            />
          </div>
          <label class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" bind:checked={deleteConfirmed} class="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600" />
            I understand the account cannot be recovered. The seed phrase alone cannot restore a deleted account.
          </label>
          <button
            type="submit"
            disabled={deleteBusy}
            class="rounded-xl bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-500 dark:text-slate-950 dark:hover:bg-red-400"
          >
            {deleteBusy ? 'Deleting…' : 'Delete account permanently'}
          </button>
        </form>
      </div>
    </div>
  {/if}
</section>
