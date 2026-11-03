// Baseline portfolio + peptide research entries and pairwise interactions.
// Descriptions are short on purpose; the AI service later enriches them.
const SUBSTANCES = [
  {
    name: "Multivitamin", slug: "multivitamin", category: "vitamin", tier: "basic",
    description: "Broad micronutrient baseline. Useful when diet variety is low; doses stay low to avoid overshooting single nutrients.",
    typical_dose: "1 serving", unit: "custom", timing: "morning, with food", evidence: "C",
  },
  {
    name: "Vitamin D3", slug: "vitamin-d3", category: "vitamin", tier: "basic",
    description: "Supports immune function, bone health and calcium metabolism. Target dose depends on latitude, skin tone and sun exposure.",
    typical_dose: "1000-4000 IU", unit: "iu", timing: "morning, with fat", evidence: "A",
  },
  {
    name: "Vitamin K2 (MK-7)", slug: "vitamin-k2", category: "vitamin", tier: "basic",
    description: "Routes calcium into bone. Commonly paired with vitamin D3.",
    typical_dose: "90-180 mcg", unit: "mcg", timing: "with a fat-containing meal", evidence: "B",
  },
  {
    name: "Omega-3 (EPA/DHA)", slug: "omega-3", category: "fatty_acid", tier: "basic",
    description: "Marine omega-3 for cardiovascular and inflammatory markers. Check EPA+DHA per capsule, not fish oil weight.",
    typical_dose: "1-2 g EPA+DHA", unit: "g", timing: "with meals", evidence: "A",
  },
  {
    name: "Magnesium Glycinate", slug: "magnesium", category: "mineral", tier: "basic",
    description: "Glycinate form is gentle on digestion and often used in the evening. Dose refers to elemental magnesium.",
    typical_dose: "200-400 mg", unit: "mg", timing: "evening", evidence: "B",
  },
  {
    name: "Zinc", slug: "zinc", category: "mineral", tier: "basic",
    description: "Immune and enzyme cofactor. Long-term high doses unbalance copper.",
    typical_dose: "15-30 mg", unit: "mg", timing: "with food", evidence: "B",
  },
  {
    name: "Vitamin C", slug: "vitamin-c", category: "vitamin", tier: "basic",
    description: "Water-soluble antioxidant and collagen cofactor. Above 500 mg most is excreted.",
    typical_dose: "250-500 mg", unit: "mg", timing: "morning", evidence: "B",
  },
  {
    name: "B-Complex", slug: "b-complex", category: "vitamin", tier: "basic",
    description: "Eight B vitamins, relevant for energy metabolism and homocysteine. Some people report insomnia from evening intake.",
    typical_dose: "1 capsule", unit: "custom", timing: "morning", evidence: "B",
  },
  {
    name: "Iron Bisglycinate", slug: "iron", category: "mineral", tier: "basic",
    description: "Only indicated with diagnosed or likely deficiency. Never stack without lab values.",
    typical_dose: "15-30 mg", unit: "mg", timing: "morning, empty stomach", evidence: "A",
  },
  {
    name: "Creatine Monohydrate", slug: "creatine", category: "amino_acid", tier: "basic",
    description: "Best-evidenced ergogenic supplement. Loading is optional; 3-5 g daily saturates muscle stores within weeks.",
    typical_dose: "3-5 g", unit: "g", timing: "any time, daily", evidence: "A",
  },
  {
    name: "Whey Protein", slug: "whey", category: "amino_acid", tier: "basic",
    description: "Convenient protein source to reach daily target. Not required when whole-food protein intake is sufficient.",
    typical_dose: "20-40 g", unit: "g", timing: "around training or as snack", evidence: "A",
  },
  {
    name: "Caffeine", slug: "caffeine", category: "other", tier: "basic",
    description: "Performance and alertness aid. Half-life is 5-6 hours; late intake harms sleep quality.",
    typical_dose: "100-200 mg", unit: "mg", timing: "before training, not after 14:00", evidence: "A",
  },
  {
    name: "Ashwagandha (KSM-66)", slug: "ashwagandha", category: "adaptogen", tier: "basic",
    description: "Adaptogen studied for stress and sleep. Avoid with thyroid medication or pregnancy.",
    typical_dose: "300-600 mg", unit: "mg", timing: "evening", evidence: "B",
  },
  {
    name: "BPC-157", slug: "bpc-157", category: "peptide", tier: "pro",
    description: "Research peptide studied for tissue repair. Human safety data is limited; not an approved drug.",
    typical_dose: "250-500 mcg", unit: "mcg", timing: "morning, empty stomach", evidence: "D",
  },
  {
    name: "TB-500 (Thymosin Beta-4 fragment)", slug: "tb-500", category: "peptide", tier: "pro",
    description: "Research peptide associated with cell migration and repair. Often stacked with BPC-157; human data limited.",
    typical_dose: "2-2.5 mg", unit: "mg", timing: "twice weekly", evidence: "D",
  },
  {
    name: "GHK-Cu", slug: "ghk-cu", category: "peptide", tier: "pro",
    description: "Copper peptide researched for skin and wound healing. Topical use is better documented than injection.",
    typical_dose: "1-2 mg", unit: "mg", timing: "evening", evidence: "D",
  },
  {
    name: "Semax", slug: "semax", category: "peptide", tier: "pro",
    description: "Synthetic ACTH fragment studied for cognition. Prescription drug in Russia, research chemical elsewhere.",
    typical_dose: "300-600 mcg", unit: "mcg", timing: "morning, intranasal", evidence: "D",
  },
  {
    name: "Selank", slug: "selank", category: "peptide", tier: "pro",
    description: "Anxiolytic peptide studied in Russia. Human data outside Russia is sparse.",
    typical_dose: "250-500 mcg", unit: "mcg", timing: "morning, intranasal", evidence: "D",
  },
  {
    name: "Ipamorelin", slug: "ipamorelin", category: "peptide", tier: "pro",
    description: "Growth hormone secretagogue. Prescription-only in most jurisdictions; bloodwork monitoring advised.",
    typical_dose: "100-200 mcg", unit: "mcg", timing: "evening, empty stomach", evidence: "D",
  },
  {
    name: "CJC-1295 (no DAC)", slug: "cjc-1295", category: "peptide", tier: "pro",
    description: "GHRH analogue often paired with a secretagogue. Affects glucose metabolism; contraindicated with insulin issues.",
    typical_dose: "100 mcg", unit: "mcg", timing: "evening", evidence: "D",
  },
]

const INTERACTIONS = [
  ["vitamin-d3", "vitamin-k2", "info", "Vitamin K2 supports calcium routing, which complements vitamin D3-driven calcium absorption.", "Pair D3 with K2 when supplementing above 2000 IU daily.", "B"],
  ["vitamin-c", "iron", "info", "Ascorbic acid improves non-heme iron absorption.", "Take vitamin C together with iron for better uptake.", "A"],
  ["zinc", "iron", "caution", "Zinc and iron compete for the same intestinal absorption pathway.", "Separate intake by at least two hours.", "B"],
  ["magnesium", "iron", "caution", "Magnesium can reduce iron absorption when taken together.", "Take magnesium in the evening and iron in the morning.", "C"],
  ["caffeine", "creatine", "caution", "Caffeine may blunt perceived performance gains and increases fluid loss during training.", "Keep caffeine moderate and hydration high; effects are individual.", "C"],
  ["bpc-157", "tb-500", "info", "Both research peptides are frequently stacked for tissue repair; human safety data is limited.", "Treat as experimental and monitor closely.", "D"],
]

migrate((app) => {
  const collection = app.findCollectionByNameOrId("substances")
  for (const s of SUBSTANCES) {
    const record = new Record(collection)
    record.set("name", s.name)
    record.set("slug", s.slug)
    record.set("category", s.category)
    record.set("description", s.description)
    record.set("typical_dose", s.typical_dose)
    record.set("unit", s.unit)
    record.set("timing", s.timing)
    record.set("evidence_level", s.evidence)
    record.set("tier_required", s.tier)
    record.set("active", true)
    app.save(record)
  }

  const interactions = app.findCollectionByNameOrId("substance_interactions")
  for (const [a, b, severity, mechanism, recommendation, evidence] of INTERACTIONS) {
    const record = new Record(interactions)
    record.set("substance_a", app.findFirstRecordByFilter("substances", "slug = {:slug}", { slug: a }).id)
    record.set("substance_b", app.findFirstRecordByFilter("substances", "slug = {:slug}", { slug: b }).id)
    record.set("severity", severity)
    record.set("mechanism", mechanism)
    record.set("recommendation", recommendation)
    record.set("evidence_level", evidence)
    app.save(record)
  }
}, (app) => {
  app.db().newQuery("DELETE FROM substance_interactions").execute()
  app.db().newQuery("DELETE FROM substances").execute()
})
