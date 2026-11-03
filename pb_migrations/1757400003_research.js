// Research layer: one paper record per source plus claims/summary on the substance.
// Dataset lives in research/evidence.json and is validated in a node test.
migrate((app) => {
  // extend evidence scale used by rejuvia (A strongest ... E weakest)
  const substances = app.findCollectionByNameOrId("substances")
  substances.fields.getByName("evidence_level").values = ["A", "B", "C", "D", "E"]
  substances.fields.add(new TextField({ name: "research_summary", max: 4000 }))
  substances.fields.add(new TextField({ name: "evidence_note", max: 1000 }))
  substances.fields.add(new JSONField({ name: "claims", maxSize: 20000 }))
  substances.fields.add(new DateField({ name: "research_updated" }))
  app.save(substances)

  app.save(new Collection({
    type: "base",
    name: "substance_evidence",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { type: "relation", name: "substance", collectionId: substances.id, maxSelect: 1, required: true, cascadeDelete: true },
      { type: "text", name: "title", required: true, max: 500 },
      { type: "text", name: "authors", max: 300 },
      { type: "number", name: "year", min: 1900, max: 2100, onlyInt: true },
      { type: "text", name: "venue", max: 300 },
      { type: "select", name: "kind", values: ["rct", "meta", "review", "preclinical", "in-vitro", "case", "guideline", "regulatory", "database", "other"], maxSelect: 1 },
      { type: "text", name: "doi", max: 120 },
      { type: "text", name: "pmid", max: 20 },
      { type: "url", name: "url" },
    ],
    indexes: ["CREATE INDEX idx_evidence_substance ON substance_evidence (substance)"],
  }))

  const raw = $os.readFile("research/evidence.json")
  let text = ""
  for (let i = 0; i < raw.length; i++) text += String.fromCharCode(raw[i])
  const dataset = JSON.parse(text)
  const evidenceCollection = app.findCollectionByNameOrId("substance_evidence")
  const unknown = []
  let evidenceCount = 0
  let claimCount = 0

  for (const entry of dataset.substances) {
    let substance
    try {
      substance = app.findFirstRecordByFilter("substances", "slug = {:slug}", { slug: entry.slug })
    } catch {
      unknown.push(entry.slug)
      continue
    }

    if (!entry.sources || entry.sources.length === 0) throw new Error("no sources for " + entry.slug)
    for (const source of entry.sources) {
      if (!source.title) throw new Error("source without title for " + entry.slug)
      if (!source.doi && !source.pmid && !source.url) throw new Error("source without identifier for " + entry.slug)
      const record = new Record(evidenceCollection)
      record.set("substance", substance.id)
      record.set("title", source.title)
      record.set("authors", source.authors || "")
      record.set("year", source.year || null)
      record.set("venue", source.venue || "")
      record.set("kind", source.kind || "other")
      record.set("doi", source.doi || "")
      record.set("pmid", source.pmid || "")
      record.set("url", source.url || "")
      app.save(record)
      evidenceCount++
    }

    const claims = entry.claims || []
    for (const claim of claims) {
      if (!claim.text || !["A", "B", "C", "D", "E"].includes(claim.level)) throw new Error("bad claim for " + entry.slug)
      claimCount++
    }
    substance.set("research_summary", entry.research_summary || "")
    substance.set("evidence_note", entry.evidence_note || "")
    substance.set("claims", claims)
    substance.set("evidence_level", entry.evidence_level || null)
    substance.set("research_updated", new Date().toISOString())
    app.save(substance)
  }

  if (unknown.length) throw new Error("unknown substance slugs: " + unknown.join(", "))
  console.log("research seed:", dataset.substances.length, "substances,", evidenceCount, "sources,", claimCount, "claims")
}, (app) => {
  app.db().newQuery("DELETE FROM substance_evidence").execute()
  app.delete(app.findCollectionByNameOrId("substance_evidence"))

  const substances = app.findCollectionByNameOrId("substances")
  for (const field of ["research_summary", "evidence_note", "claims", "research_updated"]) substances.fields.removeByName(field)
  substances.fields.getByName("evidence_level").values = ["A", "B", "C", "D"]
  app.save(substances)
})
