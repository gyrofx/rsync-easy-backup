import { differenceInCalendarDays } from 'date-fns'
import type { Strategy } from './types'
import type { Backup } from './backup'

// Each strategy splits time into fixed buckets of `intervalInDays` calendar days.
// The oldest backup in a bucket is kept, all others in the same bucket expire.
// Because the buckets don't move between runs, a kept backup stays kept until it
// reaches the next (coarser) strategy.
// The newest backup never expires, no matter how old it is: it is the most recent copy of the data.
export function expiredBackups(backups: Backup[], strategies: Strategy[]) {
  const keptBuckets = new Set<string>()
  const sorted = [...backups].sort((a, b) => a.date.getTime() - b.date.getTime())
  const newest = sorted.at(-1)

  return sorted.filter((backup) => {
    if (backup === newest) return false
    const { date } = backup
    const strategy = strategies.find(({ cutOfDate }) => cutOfDate > date)
    if (!strategy) return false

    const bucket = bucketKey(strategy, date)
    if (keptBuckets.has(bucket)) return true

    keptBuckets.add(bucket)
    return false
  })
}

function bucketKey(strategy: Strategy, date: Date) {
  const bucketIndex = Math.floor(differenceInCalendarDays(date, 0) / strategy.intervalInDays)
  return `${strategy.afterDays}-${strategy.intervalInDays}-${bucketIndex}`
}
