import { afterAll, describe, expect, it, setSystemTime } from 'bun:test'
import { addHours, differenceInCalendarDays, format, parseISO } from 'date-fns'
import { expiredBackups } from './expiredBackups'
import { parseStrategyOption } from './parseStrategyOption'
import { nowUTC } from './utils/nowUTC'

afterAll(() => void setSystemTime())

describe('expiredBackups', () => {
  it('should find all backups to delete', () => {
    setSystemTime(parseISO('2020-06-01T00:00:00.000Z'))
    expect(
      expiredBackups(
        [{ date: new Date('2020-06-01T00:00:10.000Z'), name: '', path: ',' }],
        defaultStrategy(),
      ).map(({ date }) => date),
    ).toMatchInlineSnapshot('[]')
  })

  it('finds expired backups within the first strategy', () => {
    setSystemTime(parseISO('2020-06-01T00:00:00.000Z'))

    expect(
      expiredBackups(
        [
          { date: new Date('2020-06-01T00:00:00.000Z'), name: '', path: ',' },
          { date: new Date('2020-05-31T16:00:00.000Z'), name: '', path: ',' },
          { date: new Date('2020-05-31T14:00:00.000Z'), name: '', path: ',' },
          { date: new Date('2020-05-31T12:00:00.000Z'), name: '', path: ',' },
          { date: new Date('2020-05-31T01:00:00.000Z'), name: '', path: ',' },
          { date: new Date('2020-05-30T12:00:00.000Z'), name: '', path: ',' },
          { date: new Date('2020-05-30T00:00:00.000Z'), name: '', path: ',' },
          { date: new Date('2020-05-29T00:00:00.000Z'), name: '', path: ',' },
          { date: new Date('2020-05-27T12:00:00.000Z'), name: '', path: ',' },
          { date: new Date('2020-05-27T00:00:00.000Z'), name: '', path: ',' },
          { date: new Date('2020-05-20T00:00:00.000Z'), name: '', path: ',' },
          { date: new Date('2020-05-01T00:00:00.000Z'), name: '', path: ',' },
          { date: new Date('2020-04-20T00:00:00.000Z'), name: '', path: ',' },
          { date: new Date('2020-04-15T00:00:00.000Z'), name: '', path: ',' },
          { date: new Date('2020-04-10T00:00:00.000Z'), name: '', path: ',' },
          { date: new Date('2020-04-05T00:00:00.000Z'), name: '', path: ',' },
        ],
        defaultStrategy(),
      ).map(({ date }) => date),
    ).toMatchInlineSnapshot(`
      [
        2020-04-15T00:00:00.000Z,
        2020-05-27T12:00:00.000Z,
        2020-05-30T12:00:00.000Z,
      ]
    `)
  })
})

describe('expiredBackups keeps the newest backup', () => {
  it('keeps the newest backup even if it is older than all strategies', () => {
    // offline disk that missed backups for two years: 2024-05-17 is the most recent copy on it
    setSystemTime(parseISO('2026-10-19T00:00:00.000Z'))
    const backups = ['2023-07-06', '2023-12-22', '2024-05-03', '2024-05-16', '2024-05-17'].map(
      (day) => ({
        date: parseISO(`${day}T02:15:00.000Z`),
        name: day,
        path: '',
      }),
    )

    const expired = expiredBackups(backups, parseStrategyOption('1:1 14:14 30:30 365:365', nowUTC()))

    expect(expired.map(({ name }) => name)).not.toContain('2024-05-17')
    expect(expired.map(({ name }) => name)).toMatchInlineSnapshot(`
      [
        "2024-05-03",
        "2024-05-16",
      ]
    `)
  })

  it('keeps the newest backup even if an older one is in the same bucket', () => {
    setSystemTime(parseISO('2020-06-01T00:00:00.000Z'))
    const older = { date: parseISO('2020-05-25T00:00:00.000Z'), name: 'older', path: '' }
    const newest = { date: parseISO('2020-05-26T00:00:00.000Z'), name: 'newest', path: '' }

    expect(expiredBackups([newest, older], parseStrategyOption('0:30', nowUTC()))).toEqual([])
  })
})

describe('expiredBackups over repeated runs', () => {
  it('keeps one backup per day for 14 days when backing up every 2 hours', () => {
    const end = parseISO('2026-10-09T21:30:00.000Z')
    const kept = simulateRuns(parseISO('2026-07-01T01:30:00.000Z'), end, 2, '1:1 14:14 30:30 365:365')

    const daysAgo = kept.map((date) => differenceInCalendarDays(end, date))
    for (let day = 2; day <= 13; day++) {
      expect(daysAgo.filter((d) => d === day)).toHaveLength(1)
    }
    expect(kept.map((date) => format(date, 'yyyy-MM-dd HH:mm'))).toMatchInlineSnapshot(`
      [
        "2026-07-01 01:30",
        "2026-07-16 01:30",
        "2026-08-13 01:30",
        "2026-09-10 01:30",
        "2026-09-24 01:30",
        "2026-09-26 01:30",
        "2026-09-27 01:30",
        "2026-09-28 01:30",
        "2026-09-29 01:30",
        "2026-09-30 01:30",
        "2026-10-01 01:30",
        "2026-10-02 01:30",
        "2026-10-03 01:30",
        "2026-10-04 01:30",
        "2026-10-05 01:30",
        "2026-10-06 01:30",
        "2026-10-07 01:30",
        "2026-10-08 01:30",
        "2026-10-08 21:30",
        "2026-10-08 23:30",
        "2026-10-09 01:30",
        "2026-10-09 03:30",
        "2026-10-09 05:30",
        "2026-10-09 07:30",
        "2026-10-09 09:30",
        "2026-10-09 11:30",
        "2026-10-09 13:30",
        "2026-10-09 15:30",
        "2026-10-09 17:30",
        "2026-10-09 19:30",
        "2026-10-09 21:30",
      ]
    `)
  })
})

function simulateRuns(start: Date, end: Date, everyHours: number, strategy: string) {
  let existing: Date[] = []
  for (let now = start; now <= end; now = addHours(now, everyHours)) {
    const backups = existing.map((date) => ({ date, name: '', path: '' }))
    const expired = new Set(
      expiredBackups(backups, parseStrategyOption(strategy, now)).map(({ date }) => date.getTime()),
    )
    existing = [...existing.filter((date) => !expired.has(date.getTime())), now]
  }
  return existing
}

function defaultStrategy() {
  return parseStrategyOption('1:1 30:7', nowUTC())
}
