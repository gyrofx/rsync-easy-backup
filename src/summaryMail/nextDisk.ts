import type { RsyncSummary } from '../rsyncSummaryFromLogFile'
import { type DiskUuid, sortedDiskUuids } from './diskAlias'

export function nextDisk(latestBackup: RsyncSummary): DiskUuid | undefined {
  const disks = sortedDiskUuids()
  const currentIndex = disks.indexOf(latestBackup.disk.uuid)
  if (currentIndex === undefined) return undefined
  return currentIndex < disks.length - 1 ? disks[currentIndex + 1] : disks[0]
}
