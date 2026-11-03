// Credential rules from PRD 4.1. Usernames are stored lowercase to keep
// uniqueness (SQLite index) and login identity consistent.
export const USERNAME_PATTERN = /^[a-z0-9_]{3,32}$/

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase()
}

export function usernameError(username: string): string | null {
  if (!USERNAME_PATTERN.test(username)) {
    return 'Username must be 3-32 characters: lowercase letters, digits or underscore.'
  }
  return null
}

export function passwordError(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter.'
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter.'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain a special character.'
  return null
}
