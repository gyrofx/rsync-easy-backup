import { diskInformationFromDirectory } from './disk'

vi.mock('./shell', () => ({
  df: vi.fn().mockResolvedValue({
    availableInBytes: '152784968',
    usedInBytes: '96951088',
    devicePath: '/dev/sdb',
    totalSizeInBytes: '263174212',
  }),
}))

describe('diskInformationFromDirectory', () => {
  it('retrieves and parse disk infromation', async () => {
    expect(await diskInformationFromDirectory('/tmp')).toMatchInlineSnapshot(`
      {
        "availableInBytes": "152784968",
        "devicePath": "/dev/sdb",
        "totalSizeInBytes": "263174212",
        "usedInBytes": "96951088",
        "uuid": "3255683f-53a2-4fdf-91cf-b4c1041e2a62",
      }
    `)
  })
})
