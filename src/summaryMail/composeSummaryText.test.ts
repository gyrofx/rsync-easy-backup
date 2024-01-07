import { MockedFunction } from 'vitest'
import { composeSummarytText } from './composeSummaryText'
import { diskAlias, initDiskAliasesForTestOnly, sortedDiskAliases } from './diskAlias'

beforeAll(() => {
  initDiskAliasesForTestOnly({ 'uuid-1': 'DISK 1', 'uuid-2': 'DISK 2', 'uuid-3': 'DISK 3' })
  vi.useFakeTimers()
})

afterAll(() => void vi.useRealTimers())

describe('composeSummaryText', () => {
  it('compose the summary text', async () => {
    const date = new Date(2023, 7, 30)
    vi.setSystemTime(date)

    const text = await composeSummarytText(
      './src/summaryMail/__test__',
      new Date(2023, 7, 25),
      new Date(2023, 7, 30),
    )
    expect(text).toMatchInlineSnapshot(`
      "Next Disk ***** DISK 1 *****

      Statistic period: 25.08.2023 00:00 > 30.08.2023 00:00

      Disk: 7cfafb06-619c-452d-bfec-a0589b493e36
        path: /dev/sdd1
        uuid: 7cfafb06-619c-452d-bfec-a0589b493e36
        size: 1.92 TB
        available: 897 GB
        used: 927 GB

      Backups **************************************************

      -----------------------------------------------
        Backup winbau (31.1 GB)
          Latest backup 27.08.2023 09:10
          Available backups: 2023-08-27-071026, 2023-08-27-070001, 2023-08-27-065601, 2023-08-26-220001, 2023-08-26-210204, 2023-08-26-205534, 2023-08-26-205300, 2023-08-26-204601, 2023-08-25-224804, 2023-08-24-222524, 2023-08-15-220311, 2023-08-14-220301, 2023-08-13-220151, 2023-08-12-220127, 2023-07-11-220303, 2023-07-04-031921
      -----------------------------------------------
          Backups: 
          Backup: 27.08.2023 09:10
            Backup duration: 4 minutes 25 seconds
            Number of files: 91092
            Total file size: 31.1 GB
            Number of files transferred: 0
            Total transferred file size: 0 B
            Available backups: 2023-08-27-071026, 2023-08-27-070001, 2023-08-27-065601, 2023-08-26-220001, 2023-08-26-210204, 2023-08-26-205534, 2023-08-26-205300, 2023-08-26-204601, 2023-08-25-224804, 2023-08-24-222524, 2023-08-15-220311, 2023-08-14-220301, 2023-08-13-220151, 2023-08-12-220127, 2023-07-11-220303, 2023-07-04-031921
            Deleted backups: 
          Backup: 25.08.2023 08:56
            Backup duration: 3 minutes 54 seconds
            Number of files: 91092
            Total file size: 31.1 GB
            Number of files transferred: 0
            Total transferred file size: 0 B
            Available backups: 2023-08-27-065601, 2023-08-26-220001, 2023-08-26-210204, 2023-08-26-205534, 2023-08-26-205300, 2023-08-26-204601, 2023-08-25-224804, 2023-08-24-222524, 2023-08-15-220311, 2023-08-14-220301, 2023-08-13-220151, 2023-08-12-220127, 2023-07-11-220303, 2023-07-04-031921
            Deleted backups: 
      "
    `)
  })
})
