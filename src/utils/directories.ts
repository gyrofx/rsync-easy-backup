import { readdir } from 'fs/promises'

export async function directories(source: string) {
  const list = await readdir(source, { withFileTypes: true })
  return list.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name)
}
