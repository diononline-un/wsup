import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env } from '$env/dynamic/private'
import { withAdmin } from '$lib/server/pocketbase'

function tokenFrom(request: Request): string | null {
  const header = request.headers.get('authorization') ?? ''
  const token = header.replace(/^Bearer\s+/i, '').trim()
  return token || null
}

function recordId(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return typeof payload.id === 'string' ? payload.id : null
  } catch {
    return null
  }
}

export const POST: RequestHandler = async ({ request }) => {
  const token = tokenFrom(request)
  const id = token ? recordId(token) : null
  if (!token || !id) return json({ message: 'Not authenticated.' }, { status: 401 })

  const body = (await request.json().catch(() => null)) as { password?: unknown } | null
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!password) return json({ message: 'Enter your password to delete the account.' }, { status: 400 })

  const base = env.POCKETBASE_URL || 'http://127.0.0.1:2017'
  const userResponse = await fetch(`${base}/api/collections/users/records/${id}`, { headers: { authorization: token } })
  if (!userResponse.ok) return json({ message: 'Session expired.' }, { status: 401 })
  const user = await userResponse.json()

  // password re-check before an irreversible delete
  const login = await fetch(`${base}/api/collections/users/auth-with-password`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ identity: user.username, password }),
  })
  if (!login.ok) return json({ message: 'Wrong password. Account not deleted.' }, { status: 401 })

  // cascade rules on user relations remove profile, secrets, stacks and feeds
  await withAdmin((pb) => pb.collection('users').delete(id))
  return json({ ok: true })
}
