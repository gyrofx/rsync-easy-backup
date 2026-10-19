// End-to-end tests: compile the CLI once and run it against real directories with real rsync.

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { format, subDays } from 'date-fns'
import { version } from '../package.json'

const root = mkdtempSync(join(tmpdir(), 'rsync-easy-backup-e2e-'))
const binary = join(root, 'rsync-easy-backup')

let source: string
let destination: string
let logDir: string

beforeAll(async () => {
  const build = Bun.spawnSync(['bun', 'build', './src/main.ts', '--compile', '--outfile', binary])
  if (build.exitCode !== 0) throw new Error(`build failed: ${build.stderr.toString()}`)
})

afterAll(() => rmSync(root, { recursive: true, force: true }))

beforeEach(() => {
  const test = mkdtempSync(join(root, 'test-'))
  source = join(test, 'source')
  destination = join(test, 'destination')
  logDir = join(test, 'logs')
  mkdirSync(join(source, 'docs'), { recursive: true })
  mkdirSync(destination)
  mkdirSync(logDir)
  writeFileSync(join(source, 'docs', 'letter.docx'), 'letter')
  writeFileSync(join(source, 'Outlook.pst'), 'mailbox')
  writeFileSync(join(destination, 'backup.marker'), '')
})

describe('backup', () => {
  it('copies all files into a dated folder and points latest to it', () => {
    const result = backup()

    expect(result.exitCode).toBe(0)
    const [backupDir] = expectBackups(1)
    expect(readFileSync(join(destination, backupDir, 'docs', 'letter.docx'), 'utf-8')).toBe('letter')
    expect(readFileSync(join(destination, backupDir, 'Outlook.pst'), 'utf-8')).toBe('mailbox')
    expect(readlinkSync(join(destination, 'latest'))).toBe(backupDir)
    expect(existsSync(join(destination, '.incomplete'))).toBe(false)
  })

  it('hard links unchanged files to the previous backup and copies changed ones', async () => {
    expect(backup().exitCode).toBe(0)
    await nextSecond()
    writeFileSync(join(source, 'Outlook.pst'), 'mailbox with a new mail')
    expect(backup().exitCode).toBe(0)

    const [first, second] = expectBackups(2)
    expect(sameFile(join(first, 'docs', 'letter.docx'), join(second, 'docs', 'letter.docx'))).toBe(true)
    expect(sameFile(join(first, 'Outlook.pst'), join(second, 'Outlook.pst'))).toBe(false)
    expect(readFileSync(join(destination, second, 'Outlook.pst'), 'utf-8')).toBe(
      'mailbox with a new mail',
    )
    expect(readlinkSync(join(destination, 'latest'))).toBe(second)
  })

  it('refuses a destination without backup.marker', () => {
    rmSync(join(destination, 'backup.marker'))

    const result = backup()

    expect(result.exitCode).toBe(1)
    expect(result.output).toContain('Backup marker does not exist')
    expect(backups()).toEqual([])
  })

  it('fails when the source does not exist', () => {
    const result = backup({ source: join(source, 'missing') })

    expect(result.exitCode).toBe(1)
    expect(result.output).toContain('Source folder does not exist')
    expect(backups()).toEqual([])
  })

  it('fails when the destination does not exist', () => {
    const result = backup({ destination: join(destination, 'missing') })

    expect(result.exitCode).toBe(1)
    expect(result.output).toContain('Destination folder does not exist')
  })
})

describe('retention', () => {
  it('deletes expired backups and keeps the oldest one of each interval', () => {
    const nineDaysAgo = subDays(new Date(), 9)
    const older = previousBackup(nineDaysAgo, '010000')
    const newer = previousBackup(nineDaysAgo, '020000')

    const result = backup({ options: ['--strategy', '1:1 30:7'] })

    expect(result.exitCode).toBe(0)
    expect(backups()).toContain(older)
    expect(backups()).not.toContain(newer)
    expect(backups()).toHaveLength(2)
  })

  it('hard links against the newest backup, even if it expires in the same run', () => {
    const nineDaysAgo = subDays(new Date(), 9)
    const older = previousBackup(nineDaysAgo, '010000')
    const newer = previousBackup(nineDaysAgo, '020000')
    const newerLetter = statSync(join(destination, newer, 'docs', 'letter.docx')).ino

    expect(backup({ options: ['--strategy', '1:1 30:7'] }).exitCode).toBe(0)

    const latest = readlinkSync(join(destination, 'latest'))
    expect(statSync(join(destination, latest, 'docs', 'letter.docx')).ino).toBe(newerLetter)
    expect(backups()).toEqual([older, latest])
  })

  it('deletes nothing when the backup fails', () => {
    const nineDaysAgo = subDays(new Date(), 9)
    const older = previousBackup(nineDaysAgo, '010000')
    const newer = previousBackup(nineDaysAgo, '020000')
    const unreadable = join(source, 'docs', 'locked.docx')
    writeFileSync(unreadable, 'locked')
    chmodSync(unreadable, 0o000)

    try {
      expect(backup({ options: ['--strategy', '1:1 30:7'] }).exitCode).toBe(1)
    } finally {
      chmodSync(unreadable, 0o644)
    }

    expect(backups()).toContain(older)
    expect(backups()).toContain(newer)
  })

  it('hard links against the newest backup when all backups are older than every strategy', () => {
    // offline disk that missed backups for a long time
    const older = previousBackup(subDays(new Date(), 900), '010000')
    const newest = previousBackup(subDays(new Date(), 880), '010000')
    const newestLetter = statSync(join(destination, newest, 'docs', 'letter.docx')).ino

    expect(backup({ options: ['--strategy', '1:1 365:365'] }).exitCode).toBe(0)

    const latest = readlinkSync(join(destination, 'latest'))
    expect(statSync(join(destination, latest, 'docs', 'letter.docx')).ino).toBe(newestLetter)
    expect(backups()).toContain(older)
  })

  it('keeps every backup of the last day', () => {
    const today = previousBackup(new Date(Date.now() - 60 * 60 * 1000), undefined)

    expect(backup().exitCode).toBe(0)

    expect(backups()).toContain(today)
    expect(backups()).toHaveLength(2)
  })
})

describe('--filter', () => {
  it('excludes matching files', () => {
    expect(backup({ options: ['--filter', '- *.pst'] }).exitCode).toBe(0)

    expect(filesIn(expectBackups(1)[0])).toEqual(['docs/letter.docx'])
  })

  it('applies include and exclude rules in the given order', () => {
    const options = ['--filter', '+ */', '--filter', '+ *.pst', '--filter', '- *']
    expect(backup({ options }).exitCode).toBe(0)

    expect(filesIn(expectBackups(1)[0])).toEqual(['Outlook.pst'])
  })
})

describe('interrupted backup', () => {
  it('takes over the folder of an interrupted backup whose process has ended', () => {
    const interrupted = join(destination, '2026-01-01-010000')
    mkdirSync(interrupted)
    writeFileSync(
      join(destination, '.incomplete'),
      JSON.stringify({ pid: String(endedPid()), backupDir: interrupted }),
    )

    const result = backup()

    expect(result.exitCode).toBe(0)
    expect(result.output).toContain('Backup is not running, removing incomplete marker')
    expect(existsSync(interrupted)).toBe(false)
    expect(backups()).toHaveLength(1)
    expect(existsSync(join(destination, '.incomplete'))).toBe(false)
  })

  it('resumes the newest backup when the incomplete marker is empty', () => {
    // power loss or an unplugged disk can leave an empty marker behind
    const complete = previousBackup(subDays(new Date(), 2), '010000')
    const interrupted = join(destination, `${format(subDays(new Date(), 1), 'yyyy-MM-dd')}-010000`)
    mkdirSync(join(interrupted, 'docs'), { recursive: true })
    writeFileSync(join(destination, '.incomplete'), '')

    const result = backup()

    expect(result.exitCode).toBe(0)
    expect(result.output).toContain('Incomplete marker is corrupt')
    expect(existsSync(interrupted)).toBe(false)
    const [, resumed] = expectBackups(2)
    expect(sameFile(join(complete, 'Outlook.pst'), join(resumed, 'Outlook.pst'))).toBe(true)
    expect(existsSync(join(destination, '.incomplete'))).toBe(false)
  })

  it('removes an empty incomplete marker when there is no backup yet', () => {
    writeFileSync(join(destination, '.incomplete'), '')

    const result = backup()

    expect(result.exitCode).toBe(0)
    expectBackups(1)
    expect(existsSync(join(destination, '.incomplete'))).toBe(false)
  })

  it('takes over nothing when the interrupted backup folder was deleted', () => {
    writeFileSync(
      join(destination, '.incomplete'),
      JSON.stringify({ pid: String(endedPid()), backupDir: join(destination, '2026-01-01-010000') }),
    )

    const result = backup()

    expect(result.exitCode).toBe(0)
    expectBackups(1)
    expect(existsSync(join(destination, '.incomplete'))).toBe(false)
  })

  it('stops while the interrupted backup is still running', () => {
    const running = Bun.spawn(['sleep', '30'])
    try {
      writeFileSync(
        join(destination, '.incomplete'),
        JSON.stringify({ pid: String(running.pid), backupDir: 'x' }),
      )

      const result = backup()

      expect(result.exitCode).toBe(1)
      expect(result.output).toContain('Backup is still running')
      expect(backups()).toEqual([])
    } finally {
      running.kill()
    }
  })
})

describe('--summary-dir', () => {
  it('writes a summary with the statistics, the backups and the disk', () => {
    const summaryDir = join(root, `summary-${Date.now()}`)
    mkdirSync(summaryDir)

    const result = backup({
      options: ['--summary-dir', summaryDir],
      env: { PATH: `${fakeBlkid()}:${process.env['PATH']}` },
    })

    expect(result.exitCode).toBe(0)
    const files = readdirSync(summaryDir)
    expect(files).toEqual([expect.stringMatching(/^e2e-\d{4}-\d{2}-\d{2}-\d{6}\.json$/)])
    const summary = JSON.parse(readFileSync(join(summaryDir, String(files[0])), 'utf-8'))
    expect(summary).toMatchObject({
      name: 'e2e',
      source,
      numberOfFiles: 2,
      numberOfRegularFilesTransferred: 2,
      deletedBackups: [],
      availableBackups: backups(),
      disk: { uuid: 'e2e-test-uuid' },
    })
    expect(summary.totalFileSize).toBeGreaterThan(0)
    expect(summary.disk.totalSizeInBytes).toBeGreaterThan(0)
  })
})

describe('cli', () => {
  it('prints the version from package.json', () => {
    const result = run(['--version'])

    expect(result.exitCode).toBe(0)
    expect(result.output.trim()).toBe(version)
  })
})

// ---------------------------------------------------------------- helpers

function run(args: string[], env: Record<string, string> = {}) {
  const result = Bun.spawnSync([binary, ...args], { env: { ...process.env, ...env } })
  return { exitCode: result.exitCode, output: result.stdout.toString() + result.stderr.toString() }
}

function backup(
  props: {
    options?: string[]
    source?: string
    destination?: string
    env?: Record<string, string>
  } = {},
) {
  const { options = [], env = {} } = props
  return run(
    [
      'backup',
      '--log-dir',
      logDir,
      ...options,
      'e2e',
      props.source ?? source,
      props.destination ?? destination,
    ],
    env,
  )
}

function backups() {
  return readdirSync(destination)
    .filter((name) => /^\d{4}-\d{2}-\d{2}-\d{6}$/.test(name))
    .sort()
}

/** the backup folders, failing the test unless there are exactly `count` of them */
function expectBackups<N extends 1 | 2>(count: N): N extends 1 ? [string] : [string, string] {
  const all = backups()
  expect(all).toHaveLength(count)
  return all as N extends 1 ? [string] : [string, string]
}

function filesIn(backupDir: string) {
  return (readdirSync(join(destination, backupDir), { recursive: true }) as string[])
    .filter((path) => statSync(join(destination, backupDir, path)).isFile())
    .sort()
}

function sameFile(a: string, b: string) {
  const statA = statSync(join(destination, a))
  const statB = statSync(join(destination, b))
  return statA.ino === statB.ino && statA.dev === statB.dev
}

/** creates a backup folder as an earlier run would have, with the same file times as the source */
function previousBackup(date: Date, time: string | undefined) {
  const name = time ? `${format(date, 'yyyy-MM-dd')}-${time}` : format(date, 'yyyy-MM-dd-HHmmss')
  cpSync(source, join(destination, name), { recursive: true, preserveTimestamps: true })
  return name
}

function endedPid() {
  const ended = Bun.spawnSync(['true'])
  return ended.pid
}

/** a blkid that reports a fixed UUID, because temp directories often aren't on a real block device */
function fakeBlkid() {
  const dir = join(root, 'fake-bin')
  mkdirSync(dir, { recursive: true })
  const script = join(dir, 'blkid')
  writeFileSync(
    script,
    '#!/bin/sh\necho "$1: UUID=\\"e2e-test-uuid\\" BLOCK_SIZE=\\"4096\\" TYPE=\\"ext4\\""\n',
  )
  chmodSync(script, 0o755)
  return dir
}

/** backup folders are named by the second, so two backups in a row need a new second */
function nextSecond() {
  return Bun.sleep(1000 - (Date.now() % 1000) + 50)
}
