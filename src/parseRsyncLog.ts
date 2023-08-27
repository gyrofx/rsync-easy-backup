export function parseRsyncLog(logFileContent: string) {
  const lines = logFileContent.split('\n')
  const files = lines
    .map((line) => {
      const match = line.match(/^(.)(.)\s+(.*)$/)
      if (!match) return undefined
      const [, type, status, path] = match
      return { type, status, path }
    })
    .filter((file) => file)
  return files
}
