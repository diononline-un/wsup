import PocketBase, { ClientResponseError } from 'pocketbase'
import { env } from '$env/dynamic/private'

let client: PocketBase | null = null
let pending: Promise<PocketBase> | null = null

async function authenticate(): Promise<PocketBase> {
  const email = env.PB_ADMIN_EMAIL
  const password = env.PB_ADMIN_PASSWORD
  if (!email || !password) throw new Error('PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD must be set.')
  const pb = new PocketBase(env.POCKETBASE_URL || 'http://127.0.0.1:2017')
  pb.autoCancellation(false)
  await pb.collection('_superusers').authWithPassword(email, password)
  return pb
}

/** Cached superuser client for server-side writes (signup, feeds later). */
export async function admin(): Promise<PocketBase> {
  if (client?.authStore.isValid) return client
  if (!pending) {
    pending = authenticate()
      .then((pb) => (client = pb))
      .finally(() => {
        pending = null
      })
  }
  return pending
}

/**
 * Runs a write with the cached admin client and retries once on 401.
 * PocketBase signs tokens with a secret tied to its data dir; after a database
 * rebuild or secret rotation the cached token is still "unexpired" but invalid.
 */
export async function withAdmin<T>(operation: (pb: PocketBase) => Promise<T>): Promise<T> {
  try {
    return await operation(await admin())
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 401) {
      client = null
      return operation(await admin())
    }
    throw error
  }
}
