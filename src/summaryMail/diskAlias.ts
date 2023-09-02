import { readFile } from 'fs/promises'
import { z } from 'zod'

export async function initDiskAliases(diskAliasasFilePath: string | undefined) {
  if (!diskAliasasFilePath) diskAliasesInternal = {}
  else diskAliasesInternal = await loadDiskAliasesFromFile(diskAliasasFilePath)

  console.log('Disk aliases loaded', diskAliasesInternal)
}

export function diskAlias(uuid: DiskUuid): DiskAlias | undefined {
  if (!diskAliasesInternal) return undefined
  return diskAliasesInternal[uuid]
}

export function sortedDiskAliases(): DiskAlias[] {
  return Object.values(diskAliasesInternal).sort()
}

export function sortedDiskUuids(): DiskUuid[] {
  return Object.keys(diskAliasesInternal).sort()
}

let diskAliasesInternal: DiskAliases

type DiskAliases = Record<DiskUuid, DiskAlias>
export type DiskUuid = string
export type DiskAlias = string

async function loadDiskAliasesFromFile(diskAliasasFilePath: string): Promise<DiskAliases> {
  const content = await readFile(diskAliasasFilePath, 'utf-8')
  return zodDiskAliases.parse(JSON.parse(content))
}

const zodDiskAliases = z.record(z.string())

export function initDiskAliasesForTestOnly(diskAliases: DiskAliases) {
  diskAliasesInternal = diskAliases
}
