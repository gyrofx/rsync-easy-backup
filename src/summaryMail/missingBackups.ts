import { groupBy, sortBy, uniq } from 'lodash-es'
import type { RsyncSummary } from '../rsyncSummaryFromLogFile'
import type { DiskUuid } from './diskAlias'

// A failed backup writes no summary, so it would silently disappear from the mail.
// Every disk used in the period is expected to have a summary for every backup name
// seen on any disk in that period, plus the explicitly expected names (which also
// catches a backup that never succeeded at all).
export function missingBackups(summaries: RsyncSummary[], expectedNames: string[]) {
  const allNames = uniq([...summaries.map(({ name }) => name), ...expectedNames])
  const summariesByDisk = groupBy(summaries, (summary) => summary.disk.uuid)

  return Object.entries(summariesByDisk)
    .map(([diskUuid, summaries]) => {
      const names = new Set(summaries.map(({ name }) => name))
      return {
        diskUuid: diskUuid as DiskUuid,
        names: sortBy(allNames.filter((name) => !names.has(name))),
      }
    })
    .filter(({ names }) => names.length > 0)
}
