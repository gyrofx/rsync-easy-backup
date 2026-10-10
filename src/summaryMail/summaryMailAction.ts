import { composeSummarytText } from './composeSummaryText'
import { initDiskAliases } from './diskAlias'
import { initMailConfig, sendMail } from './mailConfig'
import { subDays } from 'date-fns'

export async function summaryMailAction(summaryDir: string, mailConfigPath: string, options: Options) {
  await initDiskAliases(options.diskAliasPath)
  await initMailConfig(mailConfigPath)

  const to = new Date()
  const from = subDays(to, parseInt(options.daysAgo || '0', 10) || 100 * 365)
  const expectedNames = (options.expectedBackups || '').split(/[\s,]+/).filter(Boolean)
  const { text, hasMissingBackups } = await composeSummarytText(summaryDir, from, to, expectedNames)

  await sendMail(hasMissingBackups ? 'Summary ⚠️ missing backups' : 'Summary', text)
  console.log('Summary mail sent')
}

interface Options {
  diskAliasPath?: string
  daysAgo?: string
  expectedBackups?: string
}
