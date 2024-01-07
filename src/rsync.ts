import { spawn } from 'child_process'
import { unlinkSync, writeFileSync } from 'fs'
import { join } from 'path'

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
}

export function rsync(props: RsyncProps) {
  const { source, destination, backupDir, previousBackup, logFile } = props
  return new Promise<void>((resolve, reject) => {
    const hardLinkToPreviousBackupOption = previousBackup ? [`--link-dest=${previousBackup}`] : []
    const logFileOption = `--log-file=${logFile}`

    const rsyncArgsuments = [
      ...rsyncFlags,
      ...hardLinkToPreviousBackupOption,
      logFileOption,
      `${source}/`,
      backupDir,
    ]
    console.log('rsyncArgsuments', rsyncArgsuments)

    const rsync = spawn('rsync', rsyncArgsuments, {
      stdio: 'inherit',
    })

    const pid = rsync.pid
    if (!pid) throw new Error('rsync pid is undefined')

    rsync.on('close', (code) => {
      console.log('rsyncArgsuments', rsyncArgsuments)
      console.log('rsync pid', pid)
      unlinkSync(join(destination, '.incomplete'))
      if (code === 0) resolve()
      else reject(new Error(`rsync exited with code ${code}`))
    })

    writeFileSync(join(destination, '.incomplete'), JSON.stringify({ pid: pid.toString(), backupDir }))
  })
}
