import { hoursToSeconds, subDays } from 'date-fns'
import { Strategy } from './types'
import { minLength2 } from './utils/array'
import sortBy from 'lodash-es/sortBy'

export function parseStrategyOption(strategy: string, now: Date): Strategy[] {
  return sortBy(
    strategy
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
      }),
    'afterDays'
  ).reverse()
}
