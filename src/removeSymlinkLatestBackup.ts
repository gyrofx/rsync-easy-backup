import { unlinkSync } from 'fs'
import { symlink } from 'fs/promises'
import { basename, join } from 'path'
import { symlinkExists } from './utils/symlinkExists'

export function symlinkLatestBackup(destination: string, backupDir: string) {
  const symlinkPath = join(destination, 'latest')
  symlink(basename(backupDir), symlinkPath)
}

export async function removeSymlinkLatestBackup(destination: string) {
  const symlinkPath = join(destination, 'latest')
  if (await symlinkExists(symlinkPath)) unlinkSync(symlinkPath)
}
