import { existsSync } from 'node:fs'
import { lstat } from 'node:fs/promises'

export async function symlinkExists(path: string) {
  try {
    if (existsSync(path)) return true
    return !!(await lstat(path))
  } catch {
    return false
  }
}
