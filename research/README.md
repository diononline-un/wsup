# Research dataset

`evidence.json` is the source of truth for the public evidence library. `pb_migrations/1757400003_research.js`
reads this file when the migration runs, so PocketBase must be started from the repository root
(`./scripts/dev-pb.sh` does that).

## Structure

```json
{
  "substances": [
    {
      "slug": "bpc-157",
      "evidence_level": "C",
      "evidence_note": "One sentence: why this grade",
      "research_summary": "Two to four sentences",
      "claims": [{ "text": "Paraphrased finding", "level": "C", "status": "plausible" }],
      "sources": [
        { "title": "...", "authors": "...", "year": 2022, "venue": "...",
          "kind": "meta", "doi": "10.1000/xyz", "pmid": "12345678", "url": "https://doi.org/..." }
      ]
    }
  ]
}
```

Rules enforced by `evidence.test.mjs`:

- every substance in `pb_migrations/1757400002_seed_substances.js` has exactly one entry, and no extra entries;
- each entry has a summary, an evidence level A-E and a rationale note;
- each claim carries an evidence level and a status (`established`, `plausible`, `speculative`, `refuted`);
- each source has a title, a year and a DOI or PMID plus an https URL;
- no duplicate source per substance.

## Provenance

- Peptide sources and evidence grades: extracted from an internal research portal
  (`./src/lib/forschung/subjects/`), then re-checked per DOI/PMID.
- Standard supplement sources: selected landmark trials, systematic reviews and position stands fetched from
  PubMed E-utilities (metadata: title, authors, journal, year, DOI, PMID). Claims are own paraphrases.
- Grades use this scale: A strongest, B moderate, C limited, D weak, E contradicted.

## Update workflow

1. Edit `evidence.json` (or add a new substance in the seed migration first).
2. `cd web && npm test` validates structure and the 1:1 mapping to the seeded substances.
3. For an existing database, add a new migration that re-imports the data; do not edit applied migrations.
4. Keep claims short, keep the evidence level honest. A claim without a level is a bug.
