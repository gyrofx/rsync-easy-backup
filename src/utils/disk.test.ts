import { afterAll, describe, expect, it, spyOn } from 'bun:test'
import * as execAsyncModule from '../execAsync'
import { diskInformationFromDirectory } from './disk'
import * as shell from './shell'

const dfMock = spyOn(shell, 'df').mockResolvedValue({
  availableInBytes: 152784968000,
  usedInBytes: 96951088000,
  devicePath: '/dev/sdb',
  totalSizeInBytes: 263174212000,
})

const execAsyncMock = spyOn(execAsyncModule, 'execAsync').mockResolvedValue({
  stdout: '/dev/sdb: UUID="3255683f-53a2-4fdf-91cf-b4c1041e2a62" BLOCK_SIZE="4096" TYPE="ext4"\n',
  stderr: '',
} as never)

afterAll(() => {
  dfMock.mockRestore()
  execAsyncMock.mockRestore()
})

describe('diskInformationFromDirectory', () => {
  it('retrieves and parse disk infromation', async () => {
    expect(await diskInformationFromDirectory('/tmp')).toMatchInlineSnapshot(`
      {
        "availableInBytes": 152784968000,
        "devicePath": "/dev/sdb",
        "totalSizeInBytes": 263174212000,
        "usedInBytes": 96951088000,
        "uuid": "3255683f-53a2-4fdf-91cf-b4c1041e2a62",
      }
    `)
    expect(execAsyncMock).toHaveBeenCalledWith('blkid /dev/sdb')
  })
})
