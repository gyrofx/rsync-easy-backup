import { diskInformationFromDirectory } from './utils/disk'
import { parseTextAsBytes, rsyncSummaryFromLogFile } from './rsyncSummaryFromLogFile'
import { MockedFunction } from 'vitest'

describe('parseTextAsBytes', () => {
  it('parse a bytes number with K', () => {
    expect(parseTextAsBytes('1.56K')).toBe(1560)
  })
})

vi.mock('./utils/disk')
const diskInformationFromDirectoryMock = diskInformationFromDirectory as MockedFunction<
  typeof diskInformationFromDirectory
>

diskInformationFromDirectoryMock.mockResolvedValue({
  availableInBytes: 152784968000,
  usedInBytes: 96951088000,
  devicePath: '/dev/sdb',
  totalSizeInBytes: 263174212000,
  uuid: '3255683f-53a2-4fdf-91cf-b4c1041e2a62',
})

describe('rsyncSummaryFromLogFile', () => {
  it('parse a bytes number with M', async () => {
    expect(
      await rsyncSummaryFromLogFile({
        name: 'name',
        source: '/tmp/source',
        destination: '/tmp/destination',
        backupDurationInSeconds: 10,
        backupTime: new Date(2023, 1, 1, 12, 13, 14),
        logFileContent: logFileContent(),
        deletedBackups: ['old-backup'],
        availableBackups: ['new-backup'],
      }),
    ).toMatchInlineSnapshot(`
      {
        "availableBackups": [
          "new-backup",
        ],
        "backupDurationInSeconds": 10,
        "backupTime": 2023-02-01T11:13:14.000Z,
        "deletedBackups": [
          "old-backup",
        ],
        "destination": "/tmp/destination",
        "disk": {
          "availableInBytes": 152784968000,
          "devicePath": "/dev/sdb",
          "totalSizeInBytes": 263174212000,
          "usedInBytes": 96951088000,
          "uuid": "3255683f-53a2-4fdf-91cf-b4c1041e2a62",
        },
        "name": "name",
        "numberOfFiles": 21206,
        "numberOfRegularFilesTransferred": 21206,
        "source": "/tmp/source",
        "totalFileSize": 163000000,
        "totalTransferredFileSize": 162990000,
      }
    `)
  })

  it('parse a bytes number with M 2', async () => {
    expect(
      await rsyncSummaryFromLogFile({
        name: 'name',
        source: '/tmp/source',
        destination: '/tmp/destination',
        backupTime: new Date(2023, 1, 1, 12, 13, 14),
        backupDurationInSeconds: 10,
        logFileContent: logFileContent2(),
        deletedBackups: ['old-backup'],
        availableBackups: ['new-backup'],
      }),
    ).toMatchInlineSnapshot(`
      {
        "availableBackups": [
          "new-backup",
        ],
        "backupDurationInSeconds": 10,
        "backupTime": 2023-02-01T11:13:14.000Z,
        "deletedBackups": [
          "old-backup",
        ],
        "destination": "/tmp/destination",
        "disk": {
          "availableInBytes": 152784968000,
          "devicePath": "/dev/sdb",
          "totalSizeInBytes": 263174212000,
          "usedInBytes": 96951088000,
          "uuid": "3255683f-53a2-4fdf-91cf-b4c1041e2a62",
        },
        "name": "name",
        "numberOfFiles": 21206,
        "numberOfRegularFilesTransferred": 21206,
        "source": "/tmp/source",
        "totalFileSize": 163000000,
        "totalTransferredFileSize": 162990000,
      }
    `)
  })
})

function logFileContent() {
  return `2023/08/20 23:44:18 [5571] .d..tp..... ./
2023/08/20 23:44:18 [5571] cd+++++++++ src/
2023/08/20 23:44:18 [5571] >f+++++++++ src/server.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/serverWithRedis.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/worker.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/workerWithRedis.ts
2023/08/20 23:44:18 [5571] cd+++++++++ src/db/
2023/08/20 23:44:18 [5571] >f+++++++++ src/db/updateVideoStatusInDB.ts
2023/08/20 23:44:18 [5571] cd+++++++++ src/opts/
2023/08/20 23:44:18 [5571] >f+++++++++ src/opts/opts.ts
2023/08/20 23:44:18 [5571] cd+++++++++ src/queue/
2023/08/20 23:44:18 [5571] >f+++++++++ src/queue/defaultJobOptions.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/queue/initQueues.ts
2023/08/20 23:44:18 [5571] cd+++++++++ src/redisQueue/
2023/08/20 23:44:18 [5571] >f+++++++++ src/redisQueue/initWorker.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/redisQueue/listenQueue.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/redisQueue/listenQueueBlocked.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/redisQueue/processRecordingQueue.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/redisQueue/pushRecordingJob.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/redisQueue/redis.ts
2023/08/20 23:44:18 [5571] cd+++++++++ src/server/
2023/08/20 23:44:18 [5571] >f+++++++++ src/server/Video.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/server/initWorker.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/server/processFailedQueue.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/server/processFinishedQueue.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/server/pushRecordingJob.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/server/queueNames.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/server/server.ts
2023/08/20 23:44:18 [5571] cd+++++++++ src/utils/
2023/08/20 23:44:18 [5571] >f+++++++++ src/utils/sleep.ts
2023/08/20 23:44:18 [5571] cd+++++++++ src/worker/
2023/08/20 23:44:18 [5571] >f+++++++++ src/worker/initWorker.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/worker/processRecordingQueue.ts
2023/08/20 23:44:19 [5571] Number of files: 25,104 (reg: 21,206, dir: 3,796, link: 102)
2023/08/20 23:44:19 [5571] Number of created files: 25,103 (reg: 21,206, dir: 3,795, link: 102)
2023/08/20 23:44:19 [5571] Number of deleted files: 0
2023/08/20 23:44:19 [5571] Number of regular files transferred: 21,206
2023/08/20 23:44:19 [5571] Total file size: 163.00M bytes
2023/08/20 23:44:19 [5571] Total transferred file size: 162.99M bytes
2023/08/20 23:44:19 [5571] Literal data: 162.99M bytes
2023/08/20 23:44:19 [5571] Matched data: 0 bytes
2023/08/20 23:44:19 [5571] File list size: 524.42K
2023/08/20 23:44:19 [5571] File list generation time: 0.001 seconds
2023/08/20 23:44:19 [5571] File list transfer time: 0.000 seconds
2023/08/20 23:44:19 [5571] Total bytes sent: 32.37M
2023/08/20 23:44:19 [5571] Total bytes received: 419.75K
2023/08/20 23:44:19 [5571] sent 32.37M bytes  received 419.75K bytes  7.29M bytes/sec
2023/08/20 23:44:19 [5571] total size is 163.00M  speedup is 4.97`
}

function logFileContent2() {
  return `2023/08/20 23:44:18 [5571] .d..tp..... ./
2023/08/20 23:44:18 [5571] cd+++++++++ src/
2023/08/20 23:44:18 [5571] >f+++++++++ src/server.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/serverWithRedis.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/worker.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/workerWithRedis.ts
2023/08/20 23:44:18 [5571] cd+++++++++ src/db/
2023/08/20 23:44:18 [5571] >f+++++++++ src/db/updateVideoStatusInDB.ts
2023/08/20 23:44:18 [5571] cd+++++++++ src/opts/
2023/08/20 23:44:18 [5571] >f+++++++++ src/opts/opts.ts
2023/08/20 23:44:18 [5571] cd+++++++++ src/queue/
2023/08/20 23:44:18 [5571] >f+++++++++ src/queue/defaultJobOptions.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/queue/initQueues.ts
2023/08/20 23:44:18 [5571] cd+++++++++ src/redisQueue/
2023/08/20 23:44:18 [5571] >f+++++++++ src/redisQueue/initWorker.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/redisQueue/listenQueue.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/redisQueue/listenQueueBlocked.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/redisQueue/processRecordingQueue.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/redisQueue/pushRecordingJob.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/redisQueue/redis.ts
2023/08/20 23:44:18 [5571] cd+++++++++ src/server/
2023/08/20 23:44:18 [5571] >f+++++++++ src/server/Video.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/server/initWorker.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/server/processFailedQueue.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/server/processFinishedQueue.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/server/pushRecordingJob.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/server/queueNames.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/server/server.ts
2023/08/20 23:44:18 [5571] cd+++++++++ src/utils/
2023/08/20 23:44:18 [5571] >f+++++++++ src/utils/sleep.ts
2023/08/20 23:44:18 [5571] cd+++++++++ src/worker/
2023/08/20 23:44:18 [5571] >f+++++++++ src/worker/initWorker.ts
2023/08/20 23:44:18 [5571] >f+++++++++ src/worker/processRecordingQueue.ts
2023/08/20 23:44:19 [5571] Number of files: 25,104 (reg: 21,206, dir: 3,796, link: 102)
2023/08/20 23:44:19 [5571] Number of created files: 25,103 (reg: 21,206, dir: 3,795, link: 102)
2023/08/20 23:44:19 [5571] Number of deleted files: 0
2023/08/20 23:44:19 [5571] Number of regular files transferred: 21,206
2023/08/20 23:44:19 [5571] Total file size: 163.00M bytes
2023/08/20 23:44:19 [5571] Total transferred file size: 162.99M bytes
2023/08/20 23:44:19 [5571] Literal data: 162.99M bytes
2023/08/20 23:44:19 [5571] Matched data: 0 bytes
2023/08/20 23:44:19 [5571] File list size: 524.42K
2023/08/20 23:44:19 [5571] File list generation time: 0.001 seconds
2023/08/20 23:44:19 [5571] File list transfer time: 0.000 seconds
2023/08/20 23:44:19 [5571] Total bytes sent: 32.37M
2023/08/20 23:44:19 [5571] Total bytes received: 419.75K
2023/08/20 23:44:19 [5571] sent 32.37M bytes  received 419.75K bytes  7.29M bytes/sec
2023/08/20 23:44:19 [5571] total size is 163.00M  speedup is 4.97`
}
