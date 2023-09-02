import { execAsync } from '../execAsync'

export async function df(directory: string) {
  const { stdout } = await execAsync(`df --output=source,size,used,avail,pcent ${directory}`)
  const lines = stdout.split('\n')
  const [_, data, ...rows] = lines
  if (!data) throw new Error('Failed to get disk information')
  const [devicePath, totalSizeInBytes, usedInBytes, availableInBytes] = data.split(/\s+/)

  if (!devicePath || !totalSizeInBytes || !totalSizeInBytes || !usedInBytes || !availableInBytes)
    throw new Error('Failed to get disk information')

  return {
    devicePath,
    totalSizeInBytes: parseInt(totalSizeInBytes, 10) * 1024,
    usedInBytes: parseInt(usedInBytes, 10) * 1024,
    availableInBytes: parseInt(availableInBytes, 10) * 1024,
  }
}
