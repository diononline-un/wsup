import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env } from '$env/dynamic/private'

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

export const GET: RequestHandler = async ({ request }) => {
  const token = tokenFrom(request)
  const id = token ? recordId(token) : null
  if (!token || !id) return json({ message: 'Not authenticated.' }, { status: 401 })

  const base = env.POCKETBASE_URL || 'http://127.0.0.1:2017'
  const auth = { authorization: token }
  const userResponse = await fetch(`${base}/api/collections/users/records/${id}`, { headers: auth })
  if (!userResponse.ok) return json({ message: 'Session expired.' }, { status: 401 })
  const user = await userResponse.json()

  const list = async (collection: string) => {
    const response = await fetch(
      `${base}/api/collections/${collection}/records?perPage=200&filter=${encodeURIComponent(`user = "${id}"`)}`,
      { headers: auth },
    )
    return response.ok ? (await response.json()).items : []
  }

  const [profile, stacks, feeds] = await Promise.all([list('user_profiles'), list('user_stacks'), list('calendar_feeds')])
  const username = String(user.username ?? 'account')
  const payload = {
    app: 'WSUP',
    exported_at: new Date().toISOString(),
    account: {
      username,
      tier: user.tier ?? 'basic',
      recovery_verified: Boolean(user.recovery_verified),
      created: user.created,
      updated: user.updated,
    },
    profile: profile[0] ?? null,
    stacks,
    calendar_feeds: feeds,
  }

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'content-type': 'application/json',
      'content-disposition': `attachment; filename="wsup-${username}-export.json"`,
      'cache-control': 'no-store',
    },
  })
}
