import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { sha256 } from './sha256.ts'

const hex = (bytes: Uint8Array) => Buffer.from(bytes).toString('hex')

test('sha256 matches node:crypto for edge-case lengths', () => {
  const lengths = [0, 1, 3, 55, 56, 63, 64, 65, 127, 128, 1000, 4097]
  for (const length of lengths) {
    const input = Uint8Array.from({ length }, (_, index) => (index * 37 + 11) & 0xff)
    const expected = createHash('sha256').update(input).digest('hex')
    assert.equal(hex(sha256(input)), expected, `length ${length}`)
  }
})

test('sha256 known vectors', () => {
  assert.equal(
    hex(sha256(new Uint8Array())),
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  )
  assert.equal(
    hex(sha256(new TextEncoder().encode('abc'))),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  )
  assert.equal(
    hex(sha256(new TextEncoder().encode('The quick brown fox jumps over the lazy dog'))),
    'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
  )
})
