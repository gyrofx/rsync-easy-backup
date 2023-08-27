import { execAsync } from '../execAsync'
import { df } from './shell'

export async function diskInformationFromDirectory(directory: string) {
  const { devicePath, totalSizeInBytes, usedInBytes, availableInBytes } = await df(directory)
  if (!devicePath) throw new Error('Failed to get disk information')

  const { uuid } = await getDeviceUuid(devicePath)

  return { devicePath, uuid, totalSizeInBytes, usedInBytes, availableInBytes }
}

async function getDeviceUuid(path: string) {
  const { stdout } = await execAsync(`blkid ${path}`)
  const [_, rawUuid, rawBlockSize, rawType] = stdout.split(/\s+/)

  if (!rawUuid) throw new Error('Failed to get device UUID')
  const uuid = rawUuid.replace(/UUID="(.*)"/, '$1')

  if (!rawBlockSize) throw new Error('Failed to get device block size')
  const blockSize = rawBlockSize.replace(/BLOCK_SIZE="(.*)"/, '$1')

  if (!rawType) throw new Error('Failed to get device type')
  const type = rawType.replace(/TYPE="(.*)"/, '$1')

  return { uuid, blockSize, type }
}
