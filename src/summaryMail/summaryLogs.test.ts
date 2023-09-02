import { MockedFunction } from 'vitest'
import { files } from '../utils/file'
import { summaryLogs } from './summaryLogs'

// vi.mock('../utils/file')
// const filesMock = files as MockedFunction<typeof files>

describe('summaryLogs', () => {
  it('parses all summary logs in a specificy time range', async () => {
    const logs = await summaryLogs('./src/summaryMail/__test__')
    expect(logs).toMatchInlineSnapshot(`
      [
        {
          "availableBackups": [
            "2023-08-27-071026",
            "2023-08-27-070001",
            "2023-08-27-065601",
            "2023-08-26-220001",
            "2023-08-26-210204",
            "2023-08-26-205534",
            "2023-08-26-205300",
            "2023-08-26-204601",
            "2023-08-25-224804",
            "2023-08-24-222524",
            "2023-08-15-220311",
            "2023-08-14-220301",
            "2023-08-13-220151",
            "2023-08-12-220127",
            "2023-07-11-220303",
            "2023-07-04-031921",
          ],
          "backupDurationInSeconds": 265,
          "backupTime": 2023-08-27T07:10:26.000Z,
          "deletedBackups": [],
          "destination": "/mnt/offline-backup-disk/synology/WINBAU/2023-08-27-071026",
          "disk": {
            "availableInBytes": 896780736000,
            "devicePath": "/dev/sdd1",
            "totalSizeInBytes": 1921695008000,
            "usedInBytes": 927223800000,
            "uuid": "7cfafb06-619c-452d-bfec-a0589b493e36",
          },
          "name": "winbau",
          "numberOfFiles": 91092,
          "numberOfRegularFilesTransferred": 0,
          "source": "/mnt/synology/WINBAU",
          "totalFileSize": 31130000000,
          "totalTransferredFileSize": 0,
        },
        {
          "availableBackups": [
            "2023-08-27-065601",
            "2023-08-26-220001",
            "2023-08-26-210204",
            "2023-08-26-205534",
            "2023-08-26-205300",
            "2023-08-26-204601",
            "2023-08-25-224804",
            "2023-08-24-222524",
            "2023-08-15-220311",
            "2023-08-14-220301",
            "2023-08-13-220151",
            "2023-08-12-220127",
            "2023-07-11-220303",
            "2023-07-04-031921",
          ],
          "backupDurationInSeconds": 234,
          "backupTime": 2023-08-25T06:56:01.000Z,
          "deletedBackups": [],
          "destination": "/mnt/offline-backup-disk/synology/WINBAU/2023-08-27-065601",
          "disk": {
            "availableInBytes": 896861192000,
            "devicePath": "/dev/sdd1",
            "totalSizeInBytes": 1921695008000,
            "usedInBytes": 927143344000,
            "uuid": "7cfafb06-619c-452d-bfec-a0589b493e36",
          },
          "name": "winbau",
          "numberOfFiles": 91092,
          "numberOfRegularFilesTransferred": 0,
          "source": "/mnt/synology/WINBAU",
          "totalFileSize": 31130000000,
          "totalTransferredFileSize": 0,
        },
      ]
    `)
  })
})
