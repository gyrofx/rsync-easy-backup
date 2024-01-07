import { parse } from 'date-fns'
import { readFile } from 'fs/promises'
import { sortBy } from 'lodash-es'
import { join } from 'path'
import { RsyncSummary, parseRsyncSummaryFrom } from '../rsyncSummaryFromLogFile'
import { truthy } from '../utils/array'
import { files } from '../utils/file'

export async function summaryLogs(summaryDir: string, from: Date, to: Date): Promise<RsyncSummary[]> {
  const summaries = await Promise.all(
    (await files(summaryDir))
      .map((backup) => {
        const match = backup.match(/^[a-zA-Z0-9]*-(\d{4}-\d{2}-\d{2}-\d{6})\.json$/)
        if (!match) return undefined
        const [, dateAsString] = match
        if (!dateAsString) return undefined
        const summaryDate = parse(dateAsString, 'yyyy-MM-dd-HHmmss', new Date())
        if (summaryDate < from || summaryDate > to) return undefined
        return backup
      })
      .filter(truthy)
      .map(async (filename) => {
        const content = await readFile(join(summaryDir, filename), 'utf-8')
        return parseRsyncSummaryFrom(JSON.parse(content))
      }),
  )
  return sortBy(summaries, 'backupTime').reverse()
}
