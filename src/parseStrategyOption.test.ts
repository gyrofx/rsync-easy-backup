import { parseISO } from 'date-fns'

import { parseStrategyOption } from './parseStrategyOption'
import { nowUTC } from './utils/nowUTC'

beforeAll(() => void vi.useFakeTimers())
afterAll(() => void vi.useRealTimers())

describe('parseStrategyOption', () => {
  it('parses the strategy options', () => {
    vi.setSystemTime(parseISO('2020-06-01T00:00:00.000Z'))
    expect(parseStrategyOption('1:1 30:7 365:30', nowUTC())).toMatchInlineSnapshot(`
      [
        {
          "afterDays": 365,
          "cutOfDate": 2019-06-02T00:00:00.000Z,
          "cutOfIntervalInSeconds": 2592000,
          "intervalInDays": 30,
        },
        {
          "afterDays": 30,
          "cutOfDate": 2020-05-02T00:00:00.000Z,
          "cutOfIntervalInSeconds": 604800,
          "intervalInDays": 7,
        },
        {
          "afterDays": 1,
          "cutOfDate": 2020-05-31T00:00:00.000Z,
          "cutOfIntervalInSeconds": 86400,
          "intervalInDays": 1,
        },
      ]
    `)
  })
})
