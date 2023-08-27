import { existsSync, mkdir, mkdirSync } from 'fs'
import { nowUTC } from './utils/nowUTC'
import { availableBackups, backupDirectroy, backupMarkerExists, lastBackupDir, latestBackups } from './backup'
import { rsync } from './rsync'
import { deleteBackup } from './backup'
import { expiredBackups } from './expiredBackups'
import { deleteIncompleteMarkerAndRenameDirectory, incomplete, isBackupStillRunning } from './handleIncompleteBackup'
import { removeSymlinkLatestBackup, symlinkLatestBackup } from './removeSymlinkLatestBackup'
import { Strategy } from './types'
import { rsyncSummaryFromLogFile } from './rsyncSummaryFromLogFile'
import { readFile, writeFile } from 'fs/promises'
import { basename, join } from 'path'
import { millisecondsToSeconds } from 'date-fns'

export async function rsyncAction(name: string, source: string, destination: string, options: Options) {
  if (!existsSync(source)) throw new Error('Source folder does not exist')
  if (!existsSync(destination)) throw new Error('Destination folder does not exist')
  if (!backupMarkerExists(destination)) throw new Error('Backup marker does not exist')

  const { strategy, summaryDir, logDir } = options

  const now = nowUTC()
  const startTime = now.getTime()
  const backupDir = backupDirectroy(destination, now)
  const logFilename = `${name}-${basename(backupDir)}`
  const logFile = logDir ? join(logDir, `${logFilename}.log`) : `/tmp/${logFilename}.log`

  const incompleteData = await incomplete(destination)
  if (incompleteData) {
    if (await isBackupStillRunning(incompleteData)) throw new Error('Backup is still running')
    await deleteIncompleteMarkerAndRenameDirectory(destination, backupDir, incompleteData)
  }

  const backups = await latestBackups(destination)

  const backupsToDelete = expiredBackups(backups, strategy)
  backupsToDelete.forEach(deleteBackup)

  mkdirSync(backupDir, { recursive: true })
  await removeSymlinkLatestBackup(destination)
  await rsync({ source, destination, backupDir, previousBackup: lastBackupDir(backups), logFile })
  await symlinkLatestBackup(destination, backupDir)
  const backupDurationInSeconds = millisecondsToSeconds(now.getTime() - startTime)
  if (summaryDir) {
    const summaryFile = `${summaryDir}/${logFilename}.json`
    const logFileContent = await readFile(logFile, 'utf-8')
    const summary = await rsyncSummaryFromLogFile({
      name,
      source,
      destination: backupDir,
      backupTime: now,
      backupDurationInSeconds,
      deletedBackups: backupsToDelete.map(({ name }) => name),
      availableBackups: (await availableBackups(destination)).map(({ name }) => name),
      logFileContent,
    })
    await writeFile(summaryFile, JSON.stringify(summary, null, 2))
    console.log(`Summary written to ${summaryFile}`)
  }
}

interface Options {
  strategy: Strategy[]
  summaryDir?: string
  logDir?: string
}
