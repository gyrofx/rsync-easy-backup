import { unlinkSync } from 'fs'
import { symlink } from 'fs/promises'
import { join } from 'path'
import { symlinkExists } from './utils/symlinkExists'

export function symlinkLatestBackup(destination: string, backupDir: string) {
  const symlinkPath = join(destination, 'current')
  symlink(backupDir, symlinkPath)
}

export async function removeSymlinkLatestBackup(destination: string) {
  const symlinkPath = join(destination, 'current')
  if (await symlinkExists(symlinkPath)) unlinkSync(symlinkPath)
}
