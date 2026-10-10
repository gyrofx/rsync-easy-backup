import { diskInformationFromDirectory } from './disk'

vi.mock('./shell', () => ({
  df: vi.fn().mockResolvedValue({
    availableInBytes: '152784968000',
    usedInBytes: '96951088000',
    devicePath: '/dev/sdb',
    totalSizeInBytes: '263174212000',
  }),
}))

vi.mock('../execAsync', () => ({
  execAsync: vi.fn().mockResolvedValue({
    stdout: '/dev/sdb: UUID="3255683f-53a2-4fdf-91cf-b4c1041e2a62" BLOCK_SIZE="4096" TYPE="ext4"\n',
    stderr: '',
  }),
}))

describe('diskInformationFromDirectory', () => {
  it('retrieves and parse disk infromation', async () => {
    expect(await diskInformationFromDirectory('/tmp')).toMatchInlineSnapshot(`
      {
        "availableInBytes": "152784968000",
        "devicePath": "/dev/sdb",
        "totalSizeInBytes": "263174212000",
        "usedInBytes": "96951088000",
        "uuid": "3255683f-53a2-4fdf-91cf-b4c1041e2a62",
      }
    `)
  })
})
