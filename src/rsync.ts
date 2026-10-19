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

    const rsync = spawn('rsync', rsyncArguments, {
      stdio: 'inherit',
    })

    const pid = rsync.pid
    if (!pid) throw new Error('rsync pid is undefined')

    rsync.on('close', (code) => {
      console.log('rsyncArguments', rsyncArguments)
      console.log('rsync pid', pid)
      unlinkSync(join(destination, '.incomplete'))
      if (code === 0) resolve()
      else reject(new Error(`rsync exited with code ${code}`))
    })

    writeIncompleteMarker(destination, { pid: pid.toString(), backupDir })
  })
}
