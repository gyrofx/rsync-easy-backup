import { hoursToSeconds, subDays } from 'date-fns'
import type { Strategy } from './types'
import { minLength2 } from './utils/array'

export function parseStrategyOption(strategy: string, now: Date): Strategy[] {
  return strategy
    .split(' ')
    .map((rawStrategy) => {
      return rawStrategy.split(':').map((value) => parseInt(value, 10))
    })
    .map((value) => {
      if (minLength2(value)) return value
      throw new Error('Invalid strategy')
    })
    .map(([afterDays, intervalInDays]) => {
      const cutOfDate = subDays(now, afterDays)
      const cutOfIntervalInSeconds = hoursToSeconds(intervalInDays * 24)
      return { afterDays, intervalInDays, cutOfDate, cutOfIntervalInSeconds }
    })
    .sort((a, b) => b.afterDays - a.afterDays)
}
