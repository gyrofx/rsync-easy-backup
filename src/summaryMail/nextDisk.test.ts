import { MockedFunction } from 'vitest'
import { RsyncSummary } from '../rsyncSummaryFromLogFile'
import { initDiskAliases, initDiskAliasesForTestOnly, sortedDiskAliases } from './diskAlias'
import { nextDisk } from './nextDisk'

beforeAll(async () => await initDiskAliasesForTestOnly({ 'uuid-1': '1', 'uuid-2': '2', 'uuid-3': '3' }))

describe('nextDisk', () => {
  it('returns the disk with the latest backup', async () => {
    expect(sortedDiskAliases()).toEqual(['1', '2', '3'])
    expect(nextDisk({ disk: { uuid: 'uuid-1' } } as RsyncSummary)).toBe('uuid-2')
    expect(nextDisk({ disk: { uuid: 'uuid-2' } } as RsyncSummary)).toBe('uuid-3')
    expect(nextDisk({ disk: { uuid: 'uuid-3' } } as RsyncSummary)).toBe('uuid-1')
  })
})
