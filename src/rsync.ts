import { spawn } from 'node:child_process'
import { unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { writeIncompleteMarker } from './handleIncompleteBackup'

export const rsyncFlags = [
  '-D',
  '--compress',
  '--numeric-ids',
  '--links',
  '--hard-links',
  '--one-file-system',
  '--itemize-changes',
  '--times',
  '--recursive',
  '--perms',
  '--owner',
  '--group',
  '--stats',
  '--human-readable',
]

interface RsyncProps {
  source: string
  destination: string
  backupDir: string
  previousBackup: string | undefined
  logFile: string
  filters: string[]
}

export function rsync(props: RsyncProps) {
  const { source, destination, backupDir, previousBackup, logFile, filters } = props
  return new Promise<void>((resolve, reject) => {
    const hardLinkToPreviousBackupOption = previousBackup ? [`--link-dest=${previousBackup}`] : []
    const logFileOption = `--log-file=${logFile}`
    const filterOptions = filters.map((filter) => `--filter=${filter}`)

    const rsyncArguments = [
      ...rsyncFlags,
      ...hardLinkToPreviousBackupOption,
      ...filterOptions,
      logFileOption,
      `${source}/`,
      backupDir,
    ]
    console.log('rsyncArguments', rsyncArguments)

    // write the marker before rsync starts: if writing fails (e.g. disk full), no rsync may be left running.
    // It holds the pid of this process, which waits for rsync until it ends.
    writeIncompleteMarker(destination, { pid: process.pid.toString(), backupDir })

    const rsync = spawn('rsync', rsyncArguments, {
      stdio: 'inherit',
    })

    const pid = rsync.pid
    if (!pid) throw new Error('rsync pid is undefined')

    rsync.on('close', (code) => {
      console.log('rsyncArguments', rsyncArguments)
      console.log('rsync pid', pid)
      if (code !== 0) {
        // keep the marker, so the next run knows this backup is incomplete and continues it
        reject(new Error(`rsync exited with code ${code}`))
        return
      }
      unlinkSync(join(destination, '.incomplete'))
      resolve()
    })
  })
}
