import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  deleteIncompleteMarkerAndRenameDirectory,
  incomplete,
  isBackupStillRunning,
  writeIncompleteMarker,
} from './handleIncompleteBackup'

let destination: string

beforeEach(() => {
  destination = mkdtempSync(join(tmpdir(), 'incomplete-test-'))
})
afterEach(() => rmSync(destination, { recursive: true, force: true }))

describe('incomplete', () => {
  it('returns undefined without marker', async () => {
    expect(await incomplete(destination)).toBeUndefined()
  })

  it('reads a marker written by writeIncompleteMarker', async () => {
    writeIncompleteMarker(destination, { pid: '123', backupDir: '/some/dir' })
    expect(await incomplete(destination)).toEqual({ pid: '123', backupDir: '/some/dir' })
    expect(existsSync(join(destination, '.incomplete.tmp'))).toBe(false)
  })

  it.each([[''], ['{"pid": "12'], ['garbage']])(
    'falls back to the newest backup for corrupt marker %p',
    async (content) => {
      mkdirSync(join(destination, '2024-05-17-024315'))
      mkdirSync(join(destination, '2024-05-25-021541'))
      writeFileSync(join(destination, '.incomplete'), content)
      expect(await incomplete(destination)).toEqual({
        pid: undefined,
        backupDir: join(destination, '2024-05-25-021541'),
      })
    },
  )

  it('handles a corrupt marker without any backup', async () => {
    writeFileSync(join(destination, '.incomplete'), '')
    expect(await incomplete(destination)).toEqual({ pid: undefined, backupDir: undefined })
  })
})

describe('isBackupStillRunning', () => {
  it('is false without pid', async () => {
    expect(await isBackupStillRunning({ pid: undefined, backupDir: '/some/dir' })).toBe(false)
  })
})

describe('deleteIncompleteMarkerAndRenameDirectory', () => {
  it('removes the marker and renames the incomplete backup', async () => {
    const incompleteDir = join(destination, '2024-05-25-021541')
    const backupDir = join(destination, '2026-10-19-021541')
    mkdirSync(incompleteDir)
    writeFileSync(join(incompleteDir, 'file'), 'content')
    writeFileSync(join(destination, '.incomplete'), '')

    await deleteIncompleteMarkerAndRenameDirectory(destination, backupDir, { backupDir: incompleteDir })

    expect(existsSync(join(destination, '.incomplete'))).toBe(false)
    expect(existsSync(incompleteDir)).toBe(false)
    expect(readFileSync(join(backupDir, 'file'), 'utf-8')).toBe('content')
  })

  it('only removes the marker if the incomplete backup is gone', async () => {
    writeFileSync(join(destination, '.incomplete'), '')
    await deleteIncompleteMarkerAndRenameDirectory(destination, join(destination, 'new'), {
      backupDir: join(destination, 'missing'),
    })
    expect(existsSync(join(destination, '.incomplete'))).toBe(false)
    expect(existsSync(join(destination, 'new'))).toBe(false)
  })
})
