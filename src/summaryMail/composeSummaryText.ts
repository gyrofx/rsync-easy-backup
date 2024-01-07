import { groupBy } from 'lodash-es'
import { summaryLogs } from './summaryLogs'
import { format, formatDuration, intervalToDuration, secondsToMilliseconds } from 'date-fns'
import prettyBytes from 'pretty-bytes'
import { diskAlias } from './diskAlias'
import { nextDisk } from './nextDisk'
import { RsyncSummary } from '../rsyncSummaryFromLogFile'

export async function composeSummarytText(summaryDir: string, from: Date, to: Date) {
  const summaries = await summaryLogs(summaryDir, from, to)
  let text = ''

  const latestBackup = summaries[0]
  if (!latestBackup) return text

  const nextDiskUuid = nextDisk(latestBackup)
  const nextDiskAlias = nextDiskUuid ? diskAlias(nextDiskUuid) : '???'
  text += `Next Disk ***** ${nextDiskAlias} *****\n\n`

  text += `Statistic period: ${format(from, 'dd.MM.yyyy HH:mm')} > ${format(to, 'dd.MM.yyyy HH:mm')}\n\n`

  const summariesGroupedByDisk = groupBy(summaries, (summary) => summary.disk.uuid)
  Object.entries(summariesGroupedByDisk).forEach(([_, summaries]) => {
    const latestSummaryForDisk = summaries[0]
    if (!latestSummaryForDisk) return

    const diskNamme = diskAlias(latestSummaryForDisk.disk.uuid) || latestSummaryForDisk.disk.uuid

    text += `Disk: ${diskNamme}\n`
    text += `  path: ${latestSummaryForDisk.disk.devicePath}\n`
    text += `  uuid: ${latestSummaryForDisk.disk.uuid}\n`
    text += `  size: ${prettyBytes(latestSummaryForDisk.disk.totalSizeInBytes)}\n`
    text += `  available: ${prettyBytes(latestSummaryForDisk.disk.availableInBytes)}\n`
    text += `  used: ${prettyBytes(latestSummaryForDisk.disk.usedInBytes)}\n\n`

    const summariesGroupedByName = groupBy(summaries, (summary) => summary.name)
    text += `Summary of all Backups ***********************************\n`
    text += backSummariesText(Object.values(summariesGroupedByName))

    text += `\n`
    text += `Backups **************************************************\n`

    Object.entries(summariesGroupedByName).forEach(([_, summaries]) => {
      const latestSummaryForName = summaries[0]
      if (!latestSummaryForName) return

      text += `\n-----------------------------------------------\n`
      text += `  Backup ${latestSummaryForName.name} (${prettyBytes(
        latestSummaryForName.totalFileSize,
      )})\n`
      text += `    Latest backup ${format(latestSummaryForName.backupTime, 'dd.MM.yyyy HH:mm')}\n`
      text += `    Available backups: ${latestSummaryForName.availableBackups.join(', ')}\n`
      text += `-----------------------------------------------\n`
      text += `    Backups: \n`

      summaries.forEach((summary) => {
        text += `    Backup: ${format(summary.backupTime, 'dd.MM.yyyy HH:mm')}\n`
        text += `      Backup duration: ${formatSeconds(summary.backupDurationInSeconds)}\n`
        text += `      Number of files: ${summary.numberOfFiles}\n`
        text += `      Total file size: ${prettyBytes(summary.totalFileSize)}\n`
        text += `      Number of files transferred: ${summary.numberOfRegularFilesTransferred}\n`
        text += `      Total transferred file size: ${prettyBytes(summary.totalTransferredFileSize)}\n`
        text += `      Available backups: ${summary.availableBackups.join(', ')}\n`
        text += `      Deleted backups: ${summary.deletedBackups.join(', ')}\n`
      })
    })
  })

  return text
}

function backSummariesText(summariesGroupedByName: RsyncSummary[][]) {
  return summariesGroupedByName.map(backupSummaryText).reduce((acc, line) => (acc += line), '')
}

function backupSummaryText(summaries: RsyncSummary[]) {
  const firstSummary = summaries[0]
  if (!firstSummary) return ''
  const { name, totalFileSize: totalSize, numberOfFiles: totalNumberOfFiles } = firstSummary

  const totalTransferredFileSize = summaries.reduce(
    (acc, summary) => acc + summary.totalTransferredFileSize,
    0,
  )
  const totalNumberFilesTransferred = summaries.reduce(
    (acc, summary) => acc + summary.numberOfRegularFilesTransferred,
    0,
  )
  const nofBackups = summaries.length

  return backSummaryTextTemplate({
    totalTransferredFileSize,
    totalSize,
    totalNumberFilesTransferred,
    totalNumberOfFiles,
    nofBackups,
    name,
  })
}

function backSummaryTextTemplate(props: {
  name: string
  nofBackups: number
  totalTransferredFileSize: number
  totalNumberFilesTransferred: number
  totalSize: number
  totalNumberOfFiles: number
}) {
  const {
    totalTransferredFileSize,
    totalSize,
    totalNumberFilesTransferred,
    totalNumberOfFiles,
    nofBackups,
    name,
  } = props

  const percentOfChangedFileSize = (totalTransferredFileSize / totalSize) * 100
  const percentOfChangedNumberOfFiles = (totalNumberFilesTransferred / totalNumberOfFiles) * 100

  const goodIcon = percentOfChangedFileSize < 20 && percentOfChangedNumberOfFiles < 20 ? '✅' : '⚠️'

  const sizeText = `${prettyBytes(totalTransferredFileSize)} of ${prettyBytes(
    totalSize,
  )} (${percentOfChangedFileSize.toFixed(0)} %)`
  const nofText = `${totalNumberFilesTransferred} of ${totalNumberOfFiles} Files (${percentOfChangedNumberOfFiles.toFixed(
    0,
  )} %)`
  const nofBackupsText = `${nofBackups} backups`
  return `${goodIcon} Backup ${name}: ${sizeText} ${nofText} in ${nofBackupsText}\n`
}

function formatSeconds(seconds: number) {
  const duration = intervalToDuration({ start: 0, end: secondsToMilliseconds(seconds) })
  return formatDuration(duration)
}

interface Options {
  from: Date
  to: Date
  summaryDir: string
  logDir?: string
}
