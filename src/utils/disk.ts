import { unknownErrorToPlainObject } from 'utils/errors'
import { execAsync } from '../execAsync'
import { df } from './shell'

export interface DiskInformation {
  devicePath: string
  uuid: string
  totalSizeInBytes: number
  usedInBytes: number
  availableInBytes: number
}

export async function diskInformationFromDirectory(directory: string): Promise<DiskInformation> {
  const { devicePath, totalSizeInBytes, usedInBytes, availableInBytes } = await df(directory)
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
