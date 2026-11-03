// 25-word recovery seed: 24 random BIP39 words + 1 checksum word.
// PRD asks for 25 words; BIP39 itself defines 12/24-word phrases, so the 25th
// word here is a derived checksum and not BIP39 entropy.
//
// Explicit .ts import extensions keep this module runnable with `node --test`
// without a bundler.
import { sha256 } from './sha256.ts'
import { WORDS } from './wordlist.ts'

export const SEED_WORD_COUNT = 25
const ENTROPY_WORD_COUNT = SEED_WORD_COUNT - 1
const WORD_INDEX = new Map(WORDS.map((word, index) => [word, index]))

/** Uniform random int in [0, max) via rejection sampling. */
export function randomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0 || max > 0x10000) throw new RangeError('max out of range')
  const limit = Math.floor(0x10000 / max) * max
  const buffer = new Uint16Array(1)
  for (;;) {
    crypto.getRandomValues(buffer)
    if (buffer[0] < limit) return buffer[0] % max
  }
}

/** Top 11 bits of SHA-256 over the first 24 words, used as the checksum word index. */
export function checksumIndex(words: readonly string[]): number {
  const digest = sha256(new TextEncoder().encode(words.join(' ')))
  return ((digest[0] << 8) | digest[1]) >>> 5
}

export function generatePhrase(): string[] {
  const words = Array.from({ length: ENTROPY_WORD_COUNT }, () => WORDS[randomInt(WORDS.length)])
  return [...words, WORDS[checksumIndex(words)]]
}

/** Lowercase and drop non-letters (numbering, commas, dots from pasted text). */
export function normalizePhrase(input: string | readonly string[]): string[] {
  const words = typeof input === 'string' ? input.split(/[\s,]+/) : [...input]
  return words.map((word) => word.toLowerCase().replace(/[^a-z]/g, '')).filter(Boolean)
}

export function isWord(word: string): boolean {
  return WORD_INDEX.has(word)
}

export function validatePhrase(input: string | readonly string[]): string | null {
  const phrase = normalizePhrase(input)
  if (phrase.length !== SEED_WORD_COUNT) return `Recovery seed must contain ${SEED_WORD_COUNT} words.`
  const unknown = phrase.find((word) => !isWord(word))
  if (unknown) return `"${unknown}" is not part of the recovery wordlist.`
  const expected = WORDS[checksumIndex(phrase.slice(0, ENTROPY_WORD_COUNT))]
  if (phrase[SEED_WORD_COUNT - 1] !== expected) return 'Recovery seed checksum does not match.'
  return null
}

/** 3-5 distinct positions (0-based) the user has to reproduce. */
export function quizIndices(count = 3 + randomInt(3)): number[] {
  const indices = Array.from({ length: SEED_WORD_COUNT }, (_, index) => index)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices.slice(0, count).sort((a, b) => a - b)
}

/** Returns the positions whose answer does not match the phrase (0-based). */
export function verifyQuiz(
  phrase: readonly string[],
  answers: readonly { index: number; word: string }[],
): number[] {
  const normalized = normalizePhrase(phrase)
  return answers
    .filter(({ index, word }) => normalized[index] !== normalizePhrase(word)[0])
    .map(({ index }) => index)
}

export function buildSeedFile(username: string, phrase: readonly string[], createdAt = new Date()): string {
  const numbered = phrase.map((word, index) => `${String(index + 1).padStart(2, ' ')}. ${word}`).join('\n')
  return [
    'SUPPLEMENT STACK CALCULATOR - RECOVERY SEED',
    '===========================================',
    '',
    `Username: ${username}`,
    `Created:  ${createdAt.toISOString()}`,
    '',
    'These 25 words are the only way to recover this account.',
    'Anyone who has this phrase can take over the account.',
    'Store this file offline and never share it.',
    '',
    numbered,
    '',
  ].join('\n')
}
