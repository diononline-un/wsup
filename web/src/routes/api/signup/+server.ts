import { json } from '@sveltejs/kit'
import { ClientResponseError } from 'pocketbase'
import type { RequestHandler } from './$types'
import { normalizeUsername, passwordError, usernameError } from '$lib/credentials'
import { hashRecoveryPhrase } from '$lib/server/recovery'
import { withAdmin } from '$lib/server/pocketbase'
import { validatePhrase, verifyQuiz } from '$lib/seed/phrase'

type Body = {
  username?: unknown
  password?: unknown
  phrase?: unknown
  answers?: unknown
}

function fail(field: string, message: string, status = 400) {
  return json({ field, message }, { status })
}

export const POST: RequestHandler = async ({ request }) => {
  const body = (await request.json().catch(() => null)) as Body | null
  if (!body) return fail('form', 'Invalid request body.')

  const username = normalizeUsername(typeof body.username === 'string' ? body.username : '')
  const issue = usernameError(username)
  if (issue) return fail('username', issue)

  const password = typeof body.password === 'string' ? body.password : ''
  const passIssue = passwordError(password)
  if (passIssue) return fail('password', passIssue)

  const phrase = Array.isArray(body.phrase) ? body.phrase.filter((word): word is string => typeof word === 'string') : []
  const phraseIssue = validatePhrase(phrase)
  if (phraseIssue) return fail('seed', phraseIssue)

  const answers = (Array.isArray(body.answers) ? body.answers : [])
    .filter(
      (answer): answer is { index: number; word: string } =>
        typeof answer?.index === 'number' && Number.isInteger(answer.index) && typeof answer?.word === 'string',
    )
  if (answers.length < 3 || answers.length > 5 || new Set(answers.map((a) => a.index)).size !== answers.length) {
    return fail('seed', 'Confirm between 3 and 5 distinct seed words.')
  }
  const wrong = verifyQuiz(phrase, answers)
  if (wrong.length) return fail('seed', `The seed word at position ${wrong[0] + 1} is incorrect.`)

  return withAdmin(async (pb) => {
    const filter = pb.filter('username = {:username}', { username })
    const existing = await pb.collection('users').getList(1, 1, { filter, fields: 'id' })
    if (existing.totalItems > 0) return fail('username', 'Username is already taken.', 409)

    let user
    try {
      user = await pb.collection('users').create({
        username,
        password,
        passwordConfirm: password,
        tier: 'basic',
        recovery_verified: true,
      })
    } catch (error) {
      if (error instanceof ClientResponseError && error.status === 400 && error.response?.data?.username) {
        return fail('username', 'Username is already taken.', 409)
      }
      throw error
    }

    try {
      const { hash, salt } = await hashRecoveryPhrase(phrase.join(' '))
      await pb.collection('user_secrets').create({ user: user.id, recovery_hash: hash, recovery_salt: salt })
    } catch (error) {
      // never leave an account without its recovery hash
      await pb
        .collection('users')
        .delete(user.id)
        .catch(() => {})
      throw error
    }

    return json({ id: user.id, username: user.username }, { status: 201 })
  })
}
