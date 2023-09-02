import nodemailer from 'nodemailer'
import { composeSummarytText } from './composeSummaryText'
import { initDiskAliases } from './diskAlias'
import { initMailConfig, sendMail } from './mailConfig'
import { now } from 'lodash-es'
import { subDays } from 'date-fns'

export async function summaryMailAction(summaryDir: string, mailConfigPath: string, options: Options) {
  await initDiskAliases(options.diskAliasPath)
  await initMailConfig(mailConfigPath)

  const to = new Date()
  const from = subDays(to, parseInt(options.daysAgo || '0') || 100 * 365)
  const text = await composeSummarytText(summaryDir, from, to)

  await sendMail('Summary', text)
  console.log('Summary mail sent')
}

interface Options {
  diskAliasPath?: string
  daysAgo?: string
}
