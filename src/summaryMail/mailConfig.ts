import { z } from 'zod'
import { AssertTrue, Has } from 'conditional-type-checks'
import { readFile } from 'fs/promises'
import { createTransport } from 'nodemailer'

export async function initMailConfig(path: string) {
  const content = await readFile(path, 'utf-8')
  const { transport, send } = zodMailConfig.parse(JSON.parse(content))

  transporter = createTransport(transport)
  sendConfig = send
}

export function sendMail(subjectWithoutPrefix: string, text: string) {
  if (!transporter) throw new Error('Mail not initicalized')
  if (!sendConfig) throw new Error('Mail not initicalized')

  const { to, from, subjectPrefix } = sendConfig
  const subject = `${subjectPrefix} ${subjectWithoutPrefix}`
  console.log('Sending mail', { from, to, subject })
  return transporter.sendMail({ from, to, subject, text })
}

let transporter: ReturnType<typeof createTransport> | undefined
let sendConfig: MailConfig['send'] | undefined

export interface MailConfig {
  transport: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }

  send: {
    from: string
    to: string[]
    subjectPrefix: string
  }
}

const zodMailConfig = z.object({
  transport: z.object({
    host: z.string(),
    port: z.number(),
    secure: z.boolean(),
    auth: z.object({
      user: z.string(),
      pass: z.string(),
    }),
  }),
  send: z.object({
    from: z.string(),
    to: z.array(z.string().email()),
    subjectPrefix: z.string(),
  }),
})

export type TypeTest = AssertTrue<Has<z.infer<typeof zodMailConfig>, MailConfig>>
