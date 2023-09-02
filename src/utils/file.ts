import { readdir } from 'fs/promises'

export async function files(source: string) {
  const list = await readdir(source, { withFileTypes: true })
  return list.filter((dirent) => dirent.isFile()).map((dirent) => dirent.name)
}
