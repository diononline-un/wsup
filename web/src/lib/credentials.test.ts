import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeUsername, passwordError, usernameError } from './credentials.ts'

test('username accepts lowercase alphanumeric and underscore', () => {
  assert.equal(usernameError('alice'), null)
  assert.equal(usernameError('user_42'), null)
  assert.equal(usernameError('abc'), null)
  assert.equal(normalizeUsername('  Alice_1 '), 'alice_1')
})

test('username rejects short, long and illegal values', () => {
  assert.match(usernameError('ab') ?? '', /3-32/)
  assert.match(usernameError('a'.repeat(33)) ?? '', /3-32/)
  assert.match(usernameError('alice@example') ?? '', /3-32/)
  assert.match(usernameError('') ?? '', /3-32/)
})

test('password requires length, upper, lower and special character', () => {
  assert.equal(passwordError('Abcdefg1!'), null)
  assert.match(passwordError('Abcdef!') ?? '', /8 characters/)
  assert.match(passwordError('abcdefg1!') ?? '', /uppercase/)
  assert.match(passwordError('ABCDEFG1!') ?? '', /lowercase/)
  assert.match(passwordError('Abcdefgh1') ?? '', /special/)
})
