<script lang="ts">
  import { goto } from '$app/navigation'
  import { normalizeUsername, passwordError, usernameError } from '$lib/credentials'
  import { pb } from '$lib/pocketbase'
  import { buildSeedFile, generatePhrase, quizIndices, verifyQuiz } from '$lib/seed/phrase'

  type Step = 'account' | 'seed' | 'verify'

  let step = $state<Step>('account')
  let username = $state('')
  let password = $state('')
  let confirmPassword = $state('')
  let phrase = $state<string[]>([])
  let downloaded = $state(false)
  let quiz = $state<number[]>([])
  let answers = $state<string[]>([])
  let error = $state('')
  let busy = $state(false)

  const steps: { id: Step; label: string }[] = [
    { id: 'account', label: 'Account' },
    { id: 'seed', label: 'Recovery seed' },
    { id: 'verify', label: 'Verify' },
  ]

  function startSeedStep() {
    error = ''
    username = normalizeUsername(username)
    const issue = usernameError(username) ?? passwordError(password)
    if (issue) {
      error = issue
      return
    }
    if (password !== confirmPassword) {
      error = 'Passwords do not match.'
      return
    }
    phrase = generatePhrase()
    step = 'seed'
  }

  function downloadSeed() {
    const blob = new Blob([buildSeedFile(username, phrase)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${username}-recovery-seed.txt`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    downloaded = true
  }

  function startVerifyStep() {
    if (!downloaded) {
      error = 'Download the recovery seed file before you continue.'
      return
    }
    error = ''
    quiz = quizIndices(4)
    answers = quiz.map(() => '')
    step = 'verify'
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault()
    error = ''
    const given = quiz.map((index, position) => ({ index, word: answers[position] ?? '' }))
    const wrong = verifyQuiz(phrase, given)
    if (wrong.length) {
      error = `The seed word at position ${wrong[0] + 1} is incorrect.`
      return
    }

    busy = true
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password, phrase, answers: given }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        error = data.message ?? 'Signup failed. Try again.'
        return
      }
      await pb.collection('users').authWithPassword(username, password)
      await goto('/dashboard')
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Signup failed. Try again.'
    } finally {
      busy = false
    }
  }
</script>

<svelte:head>
  <title>Create account · Stack Calculator</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
  <ol class="mb-8 flex items-center gap-3 text-sm">
    {#each steps as item, index}
      <li class="flex items-center gap-2">
        <span
          class="grid h-6 w-6 place-items-center rounded-full text-xs font-semibold {step === item.id
            ? 'bg-slate-900 text-white'
            : index < steps.findIndex((s) => s.id === step)
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-slate-200 text-slate-500'}"
        >
          {index + 1}
        </span>
        <span class:font-medium={step === item.id}>{item.label}</span>
      </li>
      {#if index < steps.length - 1}
        <li aria-hidden="true" class="h-px w-8 bg-slate-300"></li>
      {/if}
    {/each}
  </ol>

  <h1 class="text-3xl font-bold tracking-tight">
    {step === 'account' ? 'Create your anonymous account' : step === 'seed' ? 'Save your recovery seed' : 'Verify your seed'}
  </h1>

  {#if error}
    <div role="alert" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {error}
    </div>
  {/if}

  {#if step === 'account'}
    <p class="mt-3 text-slate-600">
      No email required. Your username and password are the only login data we store.
    </p>
    <form
      class="mt-8 space-y-5"
      onsubmit={(event) => {
        event.preventDefault()
        startSeedStep()
      }}
    >
      <div>
        <label for="username" class="block text-sm font-medium">Username</label>
        <input
          id="username"
          name="username"
          autocomplete="username"
          required
          bind:value={username}
          class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
          placeholder="e.g. iron_owl"
        />
        <p class="mt-1 text-xs text-slate-500">3-32 characters: lowercase letters, digits, underscore.</p>
      </div>
      <div>
        <label for="password" class="block text-sm font-medium">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autocomplete="new-password"
          required
          bind:value={password}
          class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
        />
        <p class="mt-1 text-xs text-slate-500">At least 8 characters with upper, lower and a special character.</p>
      </div>
      <div>
        <label for="confirm" class="block text-sm font-medium">Repeat password</label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autocomplete="new-password"
          required
          bind:value={confirmPassword}
          class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        class="w-full rounded-xl bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        Continue
      </button>
    </form>
  {:else if step === 'seed'}
    <p class="mt-3 text-slate-600">
      These 25 words are the only way to recover your account. We store a hash, never the words themselves. Write them
      down or keep the file somewhere safe.
    </p>

    <ol class="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-5">
      {#each phrase as word, index}
        <li class="flex items-baseline gap-2 rounded-lg bg-slate-50 px-2 py-1.5">
          <span class="w-5 text-right text-xs text-slate-400">{index + 1}</span>
          <span class="font-mono">{word}</span>
        </li>
      {/each}
    </ol>

    <div class="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      Do not share this list. Anyone with these words can take over the account. There is no email reset.
    </div>

    <div class="mt-6 flex flex-wrap gap-3">
      <button
        type="button"
        onclick={downloadSeed}
        class="rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium hover:bg-slate-50"
      >
        {downloaded ? 'Download again (.txt)' : 'Download recovery seed (.txt)'}
      </button>
      <button
        type="button"
        onclick={startVerifyStep}
        class="rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-700 {downloaded
          ? ''
          : 'cursor-not-allowed opacity-50'}"
        aria-disabled={!downloaded}
      >
        I saved the seed
      </button>
    </div>
  {:else}
    <p class="mt-3 text-slate-600">
      Type the requested words from the file you downloaded. This proves the seed is saved before the account exists.
    </p>
    <form class="mt-8 space-y-5" onsubmit={submit}>
      {#each quiz as index, position}
        <div>
          <label for={`word-${index}`} class="block text-sm font-medium">Word #{index + 1}</label>
          <input
            id={`word-${index}`}
            name={`word-${index}`}
            required
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            bind:value={answers[position]}
            class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono"
          />
        </div>
      {/each}
      <button
        type="submit"
        disabled={busy}
        class="w-full rounded-xl bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {busy ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  {/if}
</section>
