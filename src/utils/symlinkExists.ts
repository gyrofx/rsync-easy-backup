import { existsSync } from 'fs'
import { lstat } from 'fs/promises'

export async function symlinkExists(path: string) {
  try {
    if (existsSync(path)) return true
    return !!(await lstat(path))
  } catch (err: any) {
    return false
  }
}
