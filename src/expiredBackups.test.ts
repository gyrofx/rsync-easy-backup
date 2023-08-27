import { hoursToSeconds, parseISO, subDays } from 'date-fns'
import { expiredBackups } from './expiredBackups'
import { Strategy } from 'types'
import { parseStrategyOption } from './parseStrategyOption'
import { nowUTC } from './utils/nowUTC'

beforeAll(() => void vi.useFakeTimers())
afterAll(() => void vi.useRealTimers())

describe('expiredBackups', () => {
  it('should find all backups to delete', () => {
    vi.setSystemTime(parseISO('2020-06-01T00:00:00.000Z'))
    console.log('......', new Date())
    expect(
      expiredBackups([{ date: new Date('2020-06-01T00:00:10.000Z'), name: '', path: ',' }], defaultStrategy()).map(
        ({ date }) => date
      )
    ).toMatchInlineSnapshot(`[]`)
  })

  it('finds expired backups within the first strategy', () => {
    vi.setSystemTime(parseISO('2020-06-01T00:00:00.000Z'))

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
        defaultStrategy()
      ).map(({ date }) => date)
    ).toMatchInlineSnapshot(`
      [
        2020-05-30T00:00:00.000Z,
        2020-05-27T00:00:00.000Z,
        2020-04-15T00:00:00.000Z,
        2020-04-05T00:00:00.000Z,
      ]
    `)
  })
})

function defaultStrategy() {
  return parseStrategyOption('1:1 30:7', nowUTC())
}
