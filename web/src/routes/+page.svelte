<svelte:head>
  <title>Stack Calculator · Evidence-based supplement stacks</title>
  <meta
    name="description"
    content="Build a supplement and peptide stack from your biometrics, lifestyle, medications and cycle data. Anonymous account, no email."
  />
</svelte:head>

<section class="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 lg:pt-24">
  <div class="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
    <div>
      <p class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
        Evidence-based · Anonymous · Calendar-ready
      </p>
      <h1 class="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Your supplement stack, matched to your biology.
      </h1>
      <p class="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
        Answer questions about sleep, training, medication and your cycle. Get a stack with doses, timing and a
        confidence score that shows exactly where the data is solid and where we had to assume.
      </p>
      <div class="mt-8 flex flex-wrap items-center gap-3">
        <a
          href="/signup"
          class="rounded-xl bg-slate-900 px-6 py-3 font-medium text-white no-underline shadow-sm hover:bg-slate-700"
        >
          Build my stack free
        </a>
        <a href="/login" class="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 no-underline hover:bg-white">
          I already have an account
        </a>
      </div>
      <p class="mt-4 text-sm text-slate-500">No email. 25-word recovery seed. Basic tier stays free.</p>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-slate-500">Example stack</p>
          <p class="text-lg font-semibold">Male · 34 · Germany</p>
        </div>
        <div class="text-right">
          <p class="text-3xl font-bold text-emerald-600">86%</p>
          <p class="text-xs text-slate-500">Confidence</p>
        </div>
      </div>
      <ul class="mt-5 space-y-3 text-sm">
        <li class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
          <span>Vitamin D3 · 2000 IU</span><span class="font-medium text-emerald-700">08:00</span>
        </li>
        <li class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
          <span>Omega-3 · 1.5 g</span><span class="font-medium text-emerald-700">With breakfast</span>
        </li>
        <li class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
          <span>Creatine · 5 g</span><span class="font-medium text-emerald-700">Daily</span>
        </li>
        <li class="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-amber-900">
          <span>Magnesium · 300 mg</span><span class="font-medium">Assumption</span>
        </li>
      </ul>
      <p class="mt-4 text-xs text-slate-500">
        Yellow rows mark assumptions. Add sleep and diet data to turn them green.
      </p>
    </div>
  </div>
</section>

<section class="border-t border-slate-200 bg-white py-16">
  <div class="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-3">
    <div class="rounded-2xl border border-slate-200 p-6">
      <h2 class="font-semibold">Profile-aware recommendations</h2>
      <p class="mt-2 text-sm leading-relaxed text-slate-600">
        Age, weight, biological sex, medications, sun exposure and cycle data change what makes sense. Every question
        explains why we ask it.
      </p>
    </div>
    <div class="rounded-2xl border border-slate-200 p-6">
      <h2 class="font-semibold">A confidence score you can read</h2>
      <p class="mt-2 text-sm leading-relaxed text-slate-600">
        Green means solid data. Yellow marks assumptions. Red flags conflicts like double-dosing or medication
        interactions.
      </p>
    </div>
    <div class="rounded-2xl border border-slate-200 p-6">
      <h2 class="font-semibold">Bring your own stack</h2>
      <p class="mt-2 text-sm leading-relaxed text-slate-600">
        Already taking something? Enter it. We score the match against the ideal plan and call out redundancies and
        over-dosages.
      </p>
    </div>
  </div>
</section>

<section class="py-16">
  <div class="mx-auto max-w-6xl px-4 sm:px-6">
    <h2 class="text-center text-2xl font-bold tracking-tight">Simple tiers</h2>
    <div class="mx-auto mt-8 grid max-w-4xl gap-6 md:grid-cols-2">
      <div class="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 class="text-lg font-semibold">Basic</h3>
        <p class="mt-1 text-3xl font-bold">Free</p>
        <ul class="mt-4 space-y-2 text-sm text-slate-600">
          <li>Stack calculator and confidence score</li>
          <li>Baseline micronutrient and supplement portfolio</li>
          <li>1 calendar feed (webcal subscription)</li>
          <li>Standard AI analysis</li>
        </ul>
      </div>
      <div class="rounded-2xl border-2 border-slate-900 bg-white p-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Pro</h3>
          <span class="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white">Coming</span>
        </div>
        <p class="mt-1 text-3xl font-bold">Monthly / yearly</p>
        <ul class="mt-4 space-y-2 text-sm text-slate-600">
          <li>Peptides and experimental substances</li>
          <li>Up to 3 calendar feeds for separate time zones</li>
          <li>Deep paper analysis and interaction scans</li>
          <li>Safety Override Mode with consent log</li>
        </ul>
      </div>
    </div>
  </div>
</section>
