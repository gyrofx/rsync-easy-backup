import { existsSync, renameSync, unlinkSync } from 'fs'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { z } from 'zod'
import { isProcessRunning } from './utils/isProcessRunning'

export async function incomplete(destination: string) {
  if (!existsSync(join(destination, '.incomplete'))) return undefined
  const content = await readFile(join(destination, '.incomplete'))
  return zodIncomplete.parse(JSON.parse(content.toString()))
}

export async function isBackupStillRunning(incompleteData: IncompleteBackupData) {
  const { pid } = incompleteData
  return isProcessRunning(parseInt(pid, 10))
}

export async function deleteIncompleteMarkerAndRenameDirectory(
  destination: string,
  backupDir: string,
  incompleteData: IncompleteBackupData
) {
  const { pid, backupDir: incompleteBackupDir } = incompleteData

  console.log('Backup is not running, removing incomplete marker')
  await unlinkSync(join(destination, '.incomplete'))
  await renameSync(incompleteBackupDir, backupDir)

  return backupDir
}

const zodIncomplete = z.object({
  pid: z.string(),
  backupDir: z.string(),
})

export type IncompleteBackupData = z.infer<typeof zodIncomplete>
