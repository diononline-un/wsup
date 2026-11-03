import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataset = JSON.parse(fs.readFileSync(path.join(root, 'research/evidence.json'), 'utf8'))
const seed = fs.readFileSync(path.join(root, 'pb_migrations/1757400002_seed_substances.js'), 'utf8')
const seedSlugs = [...seed.matchAll(/slug: "([^"]+)"/g)].map((match) => match[1]).sort()
const LEVELS = ['A', 'B', 'C', 'D', 'E']
const STATUSES = ['established', 'plausible', 'speculative', 'refuted']

test('every seeded substance has a research entry and nothing else', () => {
  const researchSlugs = dataset.substances.map((entry) => entry.slug).sort()
  assert.deepEqual(researchSlugs, seedSlugs)
})

test('entries carry a summary, evidence level and note', () => {
  for (const entry of dataset.substances) {
    assert.ok(LEVELS.includes(entry.evidence_level), `${entry.slug} level`)
    assert.ok(entry.research_summary.length > 80, `${entry.slug} summary too short`)
    assert.ok(entry.evidence_note.length > 20, `${entry.slug} note too short`)
  }
})

test('claims are labelled with an evidence level and status', () => {
  for (const entry of dataset.substances) {
    assert.ok(entry.claims.length >= 1 && entry.claims.length <= 5, `${entry.slug} claim count`)
    for (const claim of entry.claims) {
      assert.ok(claim.text.length > 20, `${entry.slug} claim text`)
      assert.ok(LEVELS.includes(claim.level), `${entry.slug} claim level`)
      assert.ok(STATUSES.includes(claim.status), `${entry.slug} claim status`)
    }
  }
})

test('sources have metadata and a resolvable identifier', () => {
  for (const entry of dataset.substances) {
    assert.ok(entry.sources.length >= 1 && entry.sources.length <= 6, `${entry.slug} source count`)
    const seen = new Set()
    for (const source of entry.sources) {
      assert.ok(source.title, `${entry.slug} source title`)
      assert.ok(source.doi || source.pmid, `${entry.slug} source identifier`)
      if (source.doi) assert.match(source.doi, /^10\./, `${entry.slug} doi`)
      if (source.pmid) assert.match(String(source.pmid), /^\d{5,9}$/, `${entry.slug} pmid`)
      assert.ok(source.url?.startsWith('https://'), `${entry.slug} url`)
      assert.ok(source.year >= 1900 && source.year <= 2100, `${entry.slug} year`)
      const key = source.doi ?? source.pmid
      assert.ok(!seen.has(key), `${entry.slug} duplicate source ${key}`)
      seen.add(key)
    }
  }
})
