<script lang="ts">
  import { goto } from '$app/navigation'
  import Info from '$lib/Info.svelte'
  import { pb } from '$lib/pocketbase'
  import { onMount } from 'svelte'

  type Units = 'metric' | 'imperial'

  let ready = $state(false)
  let recordId = $state<string | null>(null)
  let units = $state<Units>('metric')
  let age = $state('')
  let heightCm = $state('')
  let heightFt = $state('')
  let heightIn = $state('')
  let weightKg = $state('')
  let weightLb = $state('')
  let biologicalSex = $state('')
  let genderIdentity = $state('')
  let sleepQuality = $state('')
  let sleepHours = $state('')
  let activityLevel = $state('')
  let caffeineIntake = $state('')
  let country = $state('')
  let allergies = $state('')
  let medications = $state('')
  let conditions = $state('')
  let cycleRegular = $state('')
  let cycleSymptoms = $state('')
  let disclaimer = $state(false)
  let error = $state('')
  let saved = $state(false)
  let busy = $state(false)

  const tooltips = {
    age: 'Age sets several dose ceilings and risk bands. WSUP refuses profiles outside 13-120.',
    body:
      'Dose ranges scale with body mass, and height plus weight feed the BMI context. We store metric values internally and convert when you switch units.',
    sex:
      'Biological sex drives enzyme activity and hormone metabolism, which changes iron, creatine and cycle logic. Gender identity never affects dosing.',
    gender: 'Only used for how we address you.',
    sleep:
      'Sleep quality and duration change stimulant, magnesium and recovery recommendations. Two people with the same stack get different advice at 5 and 8 hours.',
    activity:
      'Training load drives protein, creatine, electrolyte and calorie estimates. The calculator uses this to decide whether a baseline stack is enough.',
    caffeine:
      'A high baseline caffeine intake changes which stimulants we still suggest and when we warn about sleep impact.',
    country: 'Latitude and sun exposure drive vitamin D dosing. Without a country we fall back to a conservative 1000 IU assumption.',
    allergies: 'Allergies filter substances and excipients, for example gelatin capsules or fish oil.',
    medications:
      'Interaction checks need your current medication. ADHD medication and Bupropion, for example, change stimulant advice.',
    conditions: 'Conditions such as thyroid disease, high blood pressure or pregnancy act as hard contraindications.',
    cycle:
      'Cycle regularity and symptoms affect iron, magnesium and symptom timing. Optional, and only relevant if it applies to you.',
    disclaimer: 'You confirm that WSUP is educational and does not replace a clinician.',
  }

  function toCm(): number {
    return units === 'metric'
      ? Number(heightCm)
      : (Number(heightFt || 0) * 12 + Number(heightIn || 0)) * 2.54
  }

  function toKg(): number {
    return units === 'metric' ? Number(weightKg) : Number(weightLb) / 2.20462
  }

  function switchUnits(next: Units) {
    if (next === units) return
    if (next === 'imperial') {
      if (weightKg) weightLb = String(Math.round(Number(weightKg) * 2.20462 * 10) / 10)
      if (heightCm) {
        const totalInches = Number(heightCm) / 2.54
        heightFt = String(Math.floor(totalInches / 12))
        heightIn = String(Math.round(totalInches % 12))
      }
    } else {
      if (weightLb) weightKg = String(Math.round((Number(weightLb) / 2.20462) * 10) / 10)
      if (heightFt || heightIn) heightCm = String(Math.round((Number(heightFt || 0) * 12 + Number(heightIn || 0)) * 2.54))
    }
    units = next
  }

  function hydrate(profile: Record<string, unknown> | null) {
    if (!profile) return
    recordId = String(profile.id)
    units = (profile.units as Units) ?? 'metric'
    age = profile.age != null ? String(profile.age) : ''
    heightCm = profile.height_cm != null ? String(profile.height_cm) : ''
    weightKg = profile.weight_kg != null ? String(profile.weight_kg) : ''
    biologicalSex = String(profile.biological_sex ?? '')
    genderIdentity = String(profile.gender_identity ?? '')
    sleepQuality = String(profile.sleep_quality ?? '')
    sleepHours = profile.sleep_hours != null ? String(profile.sleep_hours) : ''
    activityLevel = String(profile.activity_level ?? '')
    caffeineIntake = String(profile.caffeine_intake ?? '')
    country = String(profile.country ?? '')
    allergies = String(profile.allergies ?? '')
    medications = String(profile.medications ?? '')
    conditions = String(profile.conditions ?? '')
    cycleRegular = String(profile.cycle_regular ?? '')
    cycleSymptoms = String(profile.cycle_symptoms ?? '')
    disclaimer = Boolean(profile.disclaimer_acknowledged)
    if (units === 'imperial') {
      weightLb = weightKg ? String(Math.round(Number(weightKg) * 2.20462 * 10) / 10) : ''
      if (heightCm) {
        const totalInches = Number(heightCm) / 2.54
        heightFt = String(Math.floor(totalInches / 12))
        heightIn = String(Math.round(totalInches % 12))
      }
    }
  }

  onMount(async () => {
    const record = pb.authStore.record as Record<string, unknown> | null
    if (!pb.authStore.isValid || !record) {
      await goto('/login')
      return
    }
    try {
      const profile = await pb
        .collection('user_profiles')
        .getFirstListItem(pb.filter('user = {:id}', { id: String(record.id) }))
      hydrate(profile as unknown as Record<string, unknown>)
    } catch {
      // no profile yet
    }
    ready = true
  })

  async function submit(event: SubmitEvent) {
    event.preventDefault()
    error = ''
    saved = false

    const height = toCm()
    const weight = toKg()
    const ageNumber = Number(age)
    if (!Number.isInteger(ageNumber) || ageNumber < 13 || ageNumber > 120) {
      error = 'Enter an age between 13 and 120.'
      return
    }
    if (!Number.isFinite(height) || height < 100 || height > 250) {
      error = 'Enter a height between 100 and 250 cm.'
      return
    }
    if (!Number.isFinite(weight) || weight < 25 || weight > 400) {
      error = 'Enter a weight between 25 and 400 kg.'
      return
    }
    if (!biologicalSex) {
      error = 'Select your biological sex.'
      return
    }
    if (!disclaimer) {
      error = 'Confirm the medical disclaimer to save the profile.'
      return
    }
    if (country && !/^[A-Za-z]{2}$/.test(country.trim())) {
      error = 'Country must be a two-letter code such as DE or US.'
      return
    }

    const user = String((pb.authStore.record as Record<string, unknown>).id)
    const payload = {
      user,
      units,
      age: ageNumber,
      height_cm: Math.round(height * 10) / 10,
      weight_kg: Math.round(weight * 10) / 10,
      biological_sex: biologicalSex,
      gender_identity: genderIdentity,
      sleep_quality: sleepQuality,
      sleep_hours: sleepHours === '' ? null : Number(sleepHours),
      activity_level: activityLevel,
      caffeine_intake: caffeineIntake,
      country: country.trim().toUpperCase(),
      allergies: allergies.trim(),
      medications: medications.trim(),
      conditions: conditions.trim(),
      cycle_regular: biologicalSex === 'female' ? cycleRegular : '',
      cycle_symptoms: biologicalSex === 'female' ? cycleSymptoms.trim() : '',
      disclaimer_acknowledged: disclaimer,
    }

    busy = true
    try {
      if (recordId) await pb.collection('user_profiles').update(recordId, payload)
      else {
        const created = await pb.collection('user_profiles').create(payload)
        recordId = created.id
      }
      saved = true
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Could not save the profile.'
    } finally {
      busy = false
    }
  }
</script>

<svelte:head>
  <title>Your profile · WSUP</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
  <h1 class="text-3xl font-bold tracking-tight">Build your profile</h1>
  <p class="mt-3 text-slate-600 dark:text-slate-300">
    The more you answer, the fewer assumptions the stack has to make. Every field explains why we ask. Nothing here
    leaves your account.
  </p>

  {#if error}
    <div role="alert" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
      {error}
    </div>
  {/if}
  {#if saved}
    <div role="status" class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
      Profile saved. <a href="/dashboard" class="ui-link">Back to dashboard</a>
    </div>
  {/if}

  {#if !ready}
    <p class="ui-muted mt-8">Loading…</p>
  {:else}
    <form class="mt-8 space-y-8" onsubmit={submit}>
      <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <span class="text-sm font-medium">Units</span>
        <div class="flex gap-1 rounded-lg bg-slate-100 p-1 text-sm dark:bg-slate-800">
          <button
            type="button"
            onclick={() => switchUnits('metric')}
            class="rounded-md px-3 py-1.5 {units === 'metric' ? 'bg-white font-medium shadow-sm dark:bg-slate-900' : 'text-slate-600 dark:text-slate-300'}"
          >
            Metric
          </button>
          <button
            type="button"
            onclick={() => switchUnits('imperial')}
            class="rounded-md px-3 py-1.5 {units === 'imperial' ? 'bg-white font-medium shadow-sm dark:bg-slate-900' : 'text-slate-600 dark:text-slate-300'}"
          >
            Imperial
          </button>
        </div>
      </div>

      <fieldset class="ui-card space-y-5 p-5">
        <legend class="ui-section-title px-1">Body</legend>
        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <div class="flex items-center gap-1"><label for="age" class="ui-label">Age</label><Info text={tooltips.age} /></div>
            <input id="age" type="number" min="13" max="120" bind:value={age} class="ui-input" placeholder="34" />
          </div>
          <div>
            <div class="flex items-center gap-1"><label for="biological-sex" class="ui-label">Biological sex</label><Info text={tooltips.sex} /></div>
            <select id="biological-sex" bind:value={biologicalSex} class="ui-select">
              <option value="">Select…</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="intersex">Intersex</option>
            </select>
          </div>
          <div>
            <div class="flex items-center gap-1"><label for="height-cm" class="ui-label">Height</label><Info text={tooltips.body} /></div>
            {#if units === 'metric'}
              <div class="relative">
                <input id="height-cm" type="number" min="100" max="250" bind:value={heightCm} class="ui-input pr-12" placeholder="178" />
                <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm ui-muted">cm</span>
              </div>
            {:else}
              <div class="mt-1 flex gap-2">
                <div class="relative flex-1">
                  <input id="height-ft" type="number" min="3" max="8" bind:value={heightFt} class="ui-input mt-0 pr-10" placeholder="5" />
                  <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm ui-muted">ft</span>
                </div>
                <div class="relative flex-1">
                  <input id="height-in" type="number" min="0" max="11" bind:value={heightIn} class="ui-input mt-0 pr-10" placeholder="10" />
                  <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm ui-muted">in</span>
                </div>
              </div>
            {/if}
          </div>
          <div>
            <div class="flex items-center gap-1"><label for="weight-kg" class="ui-label">Weight</label><Info text={tooltips.body} /></div>
            {#if units === 'metric'}
              <div class="relative">
                <input id="weight-kg" type="number" min="25" max="400" step="0.1" bind:value={weightKg} class="ui-input pr-12" placeholder="78" />
                <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm ui-muted">kg</span>
              </div>
            {:else}
              <div class="relative">
                <input id="weight-lb" type="number" min="55" max="880" step="0.1" bind:value={weightLb} class="ui-input pr-12" placeholder="172" />
                <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm ui-muted">lb</span>
              </div>
            {/if}
          </div>
          <div class="sm:col-span-2">
            <div class="flex items-center gap-1"><label for="gender" class="ui-label">Gender identity (optional)</label><Info text={tooltips.gender} /></div>
            <input id="gender" bind:value={genderIdentity} class="ui-input" placeholder="How should we address you?" />
          </div>
        </div>
      </fieldset>

      <fieldset class="ui-card space-y-5 p-5">
        <legend class="ui-section-title px-1">Lifestyle</legend>
        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <div class="flex items-center gap-1"><label for="sleep-quality" class="ui-label">Sleep quality</label><Info text={tooltips.sleep} /></div>
            <select id="sleep-quality" bind:value={sleepQuality} class="ui-select">
              <option value="">Select…</option>
              <option value="poor">Poor</option>
              <option value="fair">Fair</option>
              <option value="good">Good</option>
              <option value="excellent">Excellent</option>
            </select>
          </div>
          <div>
            <label for="sleep-hours" class="ui-label">Average sleep (hours)</label>
            <input id="sleep-hours" type="number" min="0" max="16" step="0.5" bind:value={sleepHours} class="ui-input" placeholder="7.5" />
          </div>
          <div>
            <div class="flex items-center gap-1"><label for="activity-level" class="ui-label">Activity level</label><Info text={tooltips.activity} /></div>
            <select id="activity-level" bind:value={activityLevel} class="ui-select">
              <option value="">Select…</option>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light (1-2 sessions/week)</option>
              <option value="moderate">Moderate (3-4 sessions/week)</option>
              <option value="active">Active (5-6 sessions/week)</option>
              <option value="athlete">Athlete / daily training</option>
            </select>
          </div>
          <div>
            <div class="flex items-center gap-1"><label for="caffeine-intake" class="ui-label">Caffeine intake</label><Info text={tooltips.caffeine} /></div>
            <select id="caffeine-intake" bind:value={caffeineIntake} class="ui-select">
              <option value="">Select…</option>
              <option value="none">None</option>
              <option value="low">Low (1 cup)</option>
              <option value="moderate">Moderate (2-3 cups)</option>
              <option value="high">High (4+ cups)</option>
            </select>
          </div>
          <div class="sm:col-span-2">
            <div class="flex items-center gap-1"><label for="country" class="ui-label">Country (ISO code, optional)</label><Info text={tooltips.country} /></div>
            <input id="country" maxlength="2" bind:value={country} class="ui-input uppercase" placeholder="DE" />
          </div>
        </div>
      </fieldset>

      <fieldset class="ui-card space-y-5 p-5">
        <legend class="ui-section-title px-1">Health</legend>
        <div>
          <div class="flex items-center gap-1"><label for="allergies" class="ui-label">Allergies</label><Info text={tooltips.allergies} /></div>
          <textarea id="allergies" rows="2" bind:value={allergies} class="ui-input" placeholder="e.g. fish, gelatin, nickel"></textarea>
        </div>
        <div>
          <div class="flex items-center gap-1"><label for="medications" class="ui-label">Current medications</label><Info text={tooltips.medications} /></div>
          <textarea id="medications" rows="3" bind:value={medications} class="ui-input" placeholder="e.g. Bupropion 150 mg, methylphenidate"></textarea>
        </div>
        <div>
          <div class="flex items-center gap-1"><label for="conditions" class="ui-label">Conditions and known risks</label><Info text={tooltips.conditions} /></div>
          <textarea id="conditions" rows="2" bind:value={conditions} class="ui-input" placeholder="e.g. hypothyroidism, hypertension, pregnancy"></textarea>
        </div>
      </fieldset>

      {#if biologicalSex === 'female'}
        <fieldset class="ui-card space-y-5 p-5">
          <legend class="ui-section-title px-1">Cycle <Info text={tooltips.cycle} /></legend>
          <div>
            <label for="cycle-regular" class="ui-label">Cycle regularity</label>
            <select id="cycle-regular" bind:value={cycleRegular} class="ui-select">
              <option value="">Prefer not to say</option>
              <option value="regular">Regular</option>
              <option value="irregular">Irregular</option>
              <option value="unsure">Not sure</option>
            </select>
          </div>
          <div>
            <label for="cycle-symptoms" class="ui-label">Cycle / PMS symptoms</label>
            <textarea id="cycle-symptoms" rows="2" bind:value={cycleSymptoms} class="ui-input" placeholder="e.g. cramps, headaches, low energy in the luteal phase"></textarea>
          </div>
        </fieldset>
      {/if}

      <div class="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <input id="disclaimer" type="checkbox" bind:checked={disclaimer} class="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600" />
        <span class="text-sm text-slate-600 dark:text-slate-300">
          <label for="disclaimer">
            I understand WSUP is educational, not medical advice, and that supplements and peptides can interact with
            medication or conditions.
          </label>
          <Info text={tooltips.disclaimer} />
        </span>
      </div>

      <div class="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} class="ui-btn-primary">
          {busy ? 'Saving…' : 'Save profile'}
        </button>
        <a href="/dashboard" class="ui-btn-secondary px-5 py-3 no-underline">Back to dashboard</a>
      </div>
    </form>
  {/if}
</section>
