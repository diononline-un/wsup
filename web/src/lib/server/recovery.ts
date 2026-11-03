import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const KEY_LENGTH = 64

/** scrypt with a per-account salt; only the hash leaves this module. */
export async function hashRecoveryPhrase(phrase: string): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16).toString('hex')
  const key = (await scrypt(phrase, salt, KEY_LENGTH)) as Buffer
  return { hash: key.toString('hex'), salt }
}

export async function verifyRecoveryPhrase(phrase: string, salt: string, hash: string): Promise<boolean> {
  let stored: Buffer
  try {
    stored = Buffer.from(hash, 'hex')
  } catch {
    return false
  }
  if (stored.length !== KEY_LENGTH) return false
  const key = (await scrypt(phrase, salt, KEY_LENGTH)) as Buffer
  return timingSafeEqual(key, stored)
}
