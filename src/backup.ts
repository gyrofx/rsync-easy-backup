import { execSync } from 'node:child_process'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { format, parse } from 'date-fns'
import { directories } from './utils/directories'
import { minLength1 } from './utils/array'

export function deleteBackup(backup: Backup) {
  console.log('delete expired backup', backup)
  if (!backupMarkerExists(join(backup.path, '..')))
    throw new Error(`Backup marker does not exist in backup dir ${backup.path}`)
  execSync(`rm -rf ${backup.path}`)
}

export function backupMarkerExists(destination: string) {
  return existsSync(join(destination, 'backup.marker'))
}

export function backupDirectory(destination: string, now: Date) {
  const path = format(now, 'yyyy-MM-dd-HHmmss')
  return join(destination, path)
}

export async function latestBackups(destination: string): Promise<Backup[]> {
  const possibleBackups = (await directories(destination)).sort().reverse()
  return possibleBackups
    .filter((backup) => backup.match(/^\d{4}-\d{2}-\d{2}-\d{6}$/))
    .map((backup) => ({
      name: backup,
      date: parse(backup, 'yyyy-MM-dd-HHmmss', new Date()),
      path: join(destination, backup),
    }))
}

export function availableBackups(destination: string) {
  return latestBackups(destination)
}

export function lastBackupDir(backups: Backup[]) {
  return minLength1(backups) ? backups[0].path : undefined
}

export interface Backup {
  name: string
  path: string
  date: Date
}
