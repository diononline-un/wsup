import test from 'node:test'
import assert from 'node:assert/strict'
import { WORDS } from './wordlist.ts'
import {
  SEED_WORD_COUNT,
  buildSeedFile,
  checksumIndex,
  generatePhrase,
  normalizePhrase,
  quizIndices,
  validatePhrase,
  verifyQuiz,
} from './phrase.ts'

const abandon24 = Array(24).fill('abandon')

test('wordlist has 2048 unique words', () => {
  assert.equal(WORDS.length, 2048)
  assert.equal(new Set(WORDS).size, 2048)
})

test('checksum reference value matches independent SHA-256 computation', () => {
  // python hashlib reference: sha256("abandon "*24), top 11 bits -> 1697 -> "stage"
  assert.equal(checksumIndex(abandon24), 1697)
  assert.equal(WORDS[1697], 'stage')
})

test('generated phrase has 25 known words and validates', () => {
  const phrase = generatePhrase()
  assert.equal(phrase.length, SEED_WORD_COUNT)
  assert.equal(validatePhrase(phrase), null)
})

test('fixed phrase validates and tampered phrase fails checksum', async () => {
  const phrase = [...abandon24, 'stage']
  assert.equal(validatePhrase(phrase), null)
  const tampered = ['ability', ...abandon24.slice(1), 'stage']
  assert.match(validatePhrase(tampered) ?? '', /checksum/)
})

test('wrong word count and unknown words are rejected', () => {
  assert.match(validatePhrase(abandon24) ?? '', /25 words/)
  assert.match(validatePhrase([...abandon24, 'notaword']) ?? '', /not part of the recovery wordlist/)
})

test('quiz picks 3-5 distinct positions inside the phrase', () => {
  for (let run = 0; run < 20; run++) {
    const indices = quizIndices()
    assert.ok(indices.length >= 3 && indices.length <= 5)
    assert.equal(new Set(indices).size, indices.length)
    assert.ok(indices.every((index) => index >= 0 && index < SEED_WORD_COUNT))
  }
  assert.deepEqual(quizIndices(4).length, 4)
})

test('quiz verification reports only wrong positions', () => {
  const phrase = [...abandon24, 'stage']
  const correct = [0, 7, 24].map((index) => ({ index, word: phrase[index] }))
  assert.deepEqual(verifyQuiz(phrase, correct), [])
  // case and stray punctuation from user input are tolerated
  assert.deepEqual(verifyQuiz(phrase, [{ index: 3, word: 'ABANDON,' }]), [])
  assert.deepEqual(verifyQuiz(phrase, [...correct, { index: 3, word: 'zoo' }]), [3])
})

test('seed file round-trips through normalizePhrase', () => {
  const phrase = generatePhrase()
  const file = buildSeedFile('alice', phrase)
  assert.ok(file.includes('Username: alice'))
  assert.equal(file.trim().split('\n').length, 35)
  assert.deepEqual(normalizePhrase(file.split('\n').slice(10).join('\n')), phrase)
})
