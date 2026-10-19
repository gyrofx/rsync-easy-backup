import { closeSync, existsSync, fsyncSync, openSync, renameSync, unlinkSync, writeSync } from 'node:fs'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { z } from 'zod'
import { latestBackups } from './backup'
import { isProcessRunning } from './utils/isProcessRunning'

export async function incomplete(destination: string): Promise<IncompleteBackupData | undefined> {
  const markerFile = join(destination, '.incomplete')
  if (!existsSync(markerFile)) return undefined
  const content = (await readFile(markerFile)).toString()
  const parsed = zodIncomplete.safeParse(safeJsonParse(content))
  if (parsed.success) return parsed.data

  // A marker that is empty or truncated (e.g. power loss or disk unplugged during a backup) must
  // not block all future backups. The marker is written at the start of a backup, so the newest
  // backup directory is the incomplete one.
  const [newest] = await latestBackups(destination)
  console.log('Incomplete marker is corrupt, assuming newest backup is incomplete', {
    content,
    backupDir: newest?.path,
  })
  return { pid: undefined, backupDir: newest?.path }
}

export function writeIncompleteMarker(destination: string, data: { pid: string; backupDir: string }) {
  // write to a temporary file and rename it, so a crash never leaves an empty or truncated marker
  const markerFile = join(destination, '.incomplete')
  const tmpFile = `${markerFile}.tmp`
  const fd = openSync(tmpFile, 'w')
  try {
    writeSync(fd, JSON.stringify(data))
    fsyncSync(fd)
  } finally {
    closeSync(fd)
  }
  renameSync(tmpFile, markerFile)
}

export async function isBackupStillRunning(incompleteData: IncompleteBackupData) {
  const { pid } = incompleteData
  if (!pid) return false
  return isProcessRunning(Number.parseInt(pid, 10))
}

export async function deleteIncompleteMarkerAndRenameDirectory(
  destination: string,
  backupDir: string,
  incompleteData: IncompleteBackupData,
) {
  const { backupDir: incompleteBackupDir } = incompleteData

  console.log('Backup is not running, removing incomplete marker')
  unlinkSync(join(destination, '.incomplete'))
  if (incompleteBackupDir && existsSync(incompleteBackupDir)) renameSync(incompleteBackupDir, backupDir)

  return backupDir
}

function safeJsonParse(content: string): unknown {
  try {
    return JSON.parse(content)
  } catch {
    return undefined
  }
}

const zodIncomplete = z.object({
  pid: z.string().optional(),
  backupDir: z.string().optional(),
})

export type IncompleteBackupData = z.infer<typeof zodIncomplete>
