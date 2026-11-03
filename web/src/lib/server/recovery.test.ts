import test from 'node:test'
import assert from 'node:assert/strict'
import { hashRecoveryPhrase, verifyRecoveryPhrase } from './recovery.ts'

test('recovery hash is salted and verifies only the same phrase', async () => {
  const phrase = 'abandon ability able about above absent absorb abstract absurd abuse access accident'
  const a = await hashRecoveryPhrase(phrase)
  const b = await hashRecoveryPhrase(phrase)

  assert.match(a.hash, /^[0-9a-f]{128}$/)
  assert.match(a.salt, /^[0-9a-f]{32}$/)
  assert.notEqual(a.salt, b.salt)
  assert.notEqual(a.hash, b.hash)
  assert.equal(await verifyRecoveryPhrase(phrase, a.salt, a.hash), true)
  assert.equal(await verifyRecoveryPhrase(phrase + ' zoo', a.salt, a.hash), false)
  assert.equal(await verifyRecoveryPhrase(phrase, b.salt, a.hash), false)
  assert.equal(await verifyRecoveryPhrase(phrase, a.salt, 'not-hex'), false)
})
