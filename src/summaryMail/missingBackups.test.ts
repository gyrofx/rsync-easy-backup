import { describe, expect, it } from 'bun:test'
import type { RsyncSummary } from '../rsyncSummaryFromLogFile'
import { missingBackups } from './missingBackups'

describe('missingBackups', () => {
  it('reports names that a disk has no backup of', () => {
    const summaries = [
      summary('homes', 'rot'),
      summary('winbau', 'rot'),
      summary('homes', 'grau'),
      summary('homes', 'blau'),
      summary('winbau', 'blau'),
    ]

    expect(missingBackups(summaries, [])).toEqual([{ diskUuid: 'grau', names: ['winbau'] }])
  })

  it('reports expected names that never succeeded on any disk', () => {
    const summaries = [summary('homes', 'rot'), summary('homes', 'blau')]

    expect(missingBackups(summaries, ['homes', 'mascarpone'])).toEqual([
      { diskUuid: 'rot', names: ['mascarpone'] },
      { diskUuid: 'blau', names: ['mascarpone'] },
    ])
  })

  it('reports nothing when every disk has every backup', () => {
    const summaries = [summary('homes', 'rot'), summary('homes', 'blau')]

    expect(missingBackups(summaries, ['homes'])).toEqual([])
  })
})

function summary(name: string, diskUuid: string) {
  return { name, disk: { uuid: diskUuid } } as RsyncSummary
}
