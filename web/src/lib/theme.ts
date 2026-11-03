export type Theme = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'theme'

export function isTheme(value: string | null): value is Theme {
  return value === 'system' || value === 'light' || value === 'dark'
}

export function readTheme(storage: Pick<Storage, 'getItem'> = localStorage): Theme {
  const stored = storage.getItem(STORAGE_KEY)
  return isTheme(stored) ? stored : 'system'
}

/** Resolves the effective mode. Kept pure so the toggle logic is testable. */
export function prefersDark(theme: Theme, systemDark: boolean): boolean {
  return theme === 'dark' || (theme === 'system' && systemDark)
}

export function applyTheme(theme: Theme): void {
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.classList.toggle('dark', prefersDark(theme, systemDark))
  document.documentElement.style.colorScheme = prefersDark(theme, systemDark) ? 'dark' : 'light'
  if (theme === 'system') localStorage.removeItem(STORAGE_KEY)
  else localStorage.setItem(STORAGE_KEY, theme)
}

export function nextTheme(theme: Theme): Theme {
  return theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
}
