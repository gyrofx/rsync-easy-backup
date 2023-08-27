import { diskInformationFromDirectory } from './utils/disk'

export async function rsyncSummaryFromLogFile(props: {
  name: string
  backupTime: Date
  backupDurationInSeconds: number
  source: string
  destination: string
  logFileContent: string
  availableBackups: string[]
  deletedBackups: string[]
}) {
  const {
    name,
    source,
    destination,
    backupTime,
    logFileContent,
    backupDurationInSeconds,
    deletedBackups,
    availableBackups,
  } = props
  const lines = logFileContent.split('\n')
  const summary = {
    name,
    backupTime,
    backupDurationInSeconds,
    source,
    destination,
    numberOfFiles: 0,
    numberOfRegularFilesTransferred: 0,
    totalFileSize: 0,
    totalTransferredFileSize: 0,
  } as RsyncSummary
  lines.forEach((line) => {
    line = removeDateTimeAndPidFromLine(line.trim())
    console.log(line, line.startsWith('>f'))
    if (line.startsWith('Number of files')) {
      summary.numberOfFiles = parseNumberOfFiles(line)
    } else if (line.startsWith('Number of regular files transferred')) {
      summary.numberOfRegularFilesTransferred = parseNumber(line)
    } else if (line.startsWith('Total file size')) {
      summary.totalFileSize = parseSummaryValue(line)
    } else if (line.startsWith('Total transferred file size')) {
      summary.totalTransferredFileSize = parseSummaryValue(line)
    }
  })
  const disk = await diskInformationFromDirectory(destination)
  return { ...summary, disk, deletedBackups, availableBackups, backupDurationInSeconds }
}

export interface RsyncSummary {
  name: string
  backupTime: Date
  backupDurationInSeconds: number
  numberOfFiles: number
  numberOfRegularFilesTransferred: number
  totalFileSize: number
  totalTransferredFileSize: number
}

function removeDateTimeAndPidFromLine(line: string) {
  return line.split(' ').slice(3).join(' ')
}

function parseNumberOfFiles(line: string) {
  const match = line.match(/reg: ([0-9,]+),/)
  if (!match) throw new Error(`Invalid rsync summary`)
  return parseInt(match[1]!.replace(',', ''), 10)
}

function parseSummaryValue(line: string) {
  const parsed = line.split(':', 2)[1]?.trim().split(' ')[0]
  if (!parsed) throw new Error(`Invalid rsync summary`)
  return parseTextAsBytes(parsed)
}

export function parseTextAsBytes(text: string) {
  const factor = unitFactor(text.slice(-1))
  if (factor !== 1) text = text.slice(0, -1)
  return parseFloat(text) * factor
}

function unitFactor(char: string) {
  if (char === 'K') return 1000
  if (char === 'M') return 1000000
  if (char === 'G') return 1000000000
  if (char === 'T') return 1000000000000
  return 1
}

function parseNumber(line: string) {
  const n = line.split(':', 2)[1]?.trim().replace(',', '')
  if (!n) throw new Error(`Invalid rsync summary`)
  return parseInt(n, 10)
}
