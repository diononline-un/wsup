import test from 'node:test'
import assert from 'node:assert/strict'
import { isTheme, nextTheme, prefersDark } from './theme.ts'

test('theme resolution follows system setting only in system mode', () => {
  assert.equal(prefersDark('system', true), true)
  assert.equal(prefersDark('system', false), false)
  assert.equal(prefersDark('dark', false), true)
  assert.equal(prefersDark('light', true), false)
})

test('theme cycles system -> light -> dark -> system', () => {
  assert.equal(nextTheme('system'), 'light')
  assert.equal(nextTheme('light'), 'dark')
  assert.equal(nextTheme('dark'), 'system')
})

test('only known theme values are accepted', () => {
  assert.equal(isTheme('system'), true)
  assert.equal(isTheme('light'), true)
  assert.equal(isTheme('dark'), true)
  assert.equal(isTheme('sepia'), false)
  assert.equal(isTheme(null), false)
})
