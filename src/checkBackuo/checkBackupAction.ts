import { createHash } from 'crypto'
import { readFile } from 'fs/promises'
import { NodeSSH } from 'node-ssh'
import { z } from 'zod'
import inquirer from 'inquirer'
import { posix } from 'path'

const ssh = new NodeSSH()

export async function checkBackupAction() {
  const config = await loadConfigFile(`${process.cwd()}/.checkBackup.json`)
  const { phrase, filesToCheck, host, username } = config

  console.log('File Check')
  const { password } = await inquirer.prompt([
    {
      type: 'password',
      message: `Password for ${host}`,
      mask: '*',
      name: 'password',
    },
  ])

  const expectedHash = createHash('sha256').update(phrase).digest('hex')

  await ssh.connect({
    host,
    username,
    password,
  })

  try {
    await withMountedDisk(config, password, async () => {
      const basePath = `${config.mountPath}`
      await checkFiles(filesToCheck, expectedHash, basePath)
    })
  } catch (e) {
    console.log('Error', e)
  } finally {
    ssh.dispose()
  }
}

async function checkFiles(filesToCheck: string[], expectedHash: string, basePath: string) {
  await Promise.all(
    filesToCheck.map(async (file) => {
      const path = posix.join(basePath, file)

      if (!(await fileExists(path))) console.log(`❌ File does not exist: ${path}`)
      else await checkFileSha256(path, expectedHash)
    })
  )
}

async function checkFileSha256(path: string, expectedHash: string) {
  const { stdout } = await ssh.execCommand(`sha256sum "${path}"`)
  const [hash] = stdout.split(/\s+/)
  if (hash?.trim() === expectedHash) {
    console.log('✅ Checksum is correct', { path })
  } else {
    console.log('❌ There is a checksum problem', { path, hash, expectedHash })
  }
}

async function fileExists(path: string) {
  const { code } = await ssh.execCommand(`ls -la "${path}"`)
  return code === 0
}

async function mountDisk(device: string, mountPath: string, sudoPassword: string) {
  const { stderr, code } = await ssh.execCommand(`sudo mount ${device} "${mountPath}"`, {
    stdin: `${sudoPassword}\n`,
    execOptions: { pty: true },
  })
  if (code !== 0) throw new Error(`Error mounting disk: ${stderr}`)
}

async function unmountDisk(mountPath: string, sudoPassword: string) {
  const { stderr, code } = await ssh.execCommand(`sudo umount "${mountPath}"`, {
    stdin: `${sudoPassword}\n`,
    execOptions: { pty: true },
  })

  if (code !== 0) throw new Error(`Error mounting disk: ${stderr}`)
}

async function withMountedDisk<T>(config: Config, sudoPassword: string, fn: () => Promise<T>) {
  const { mountPath, device } = config
  await mountDisk(device, mountPath, sudoPassword)
  try {
    return await fn()
  } finally {
    await unmountDisk(mountPath, sudoPassword)
  }
}

async function loadConfigFile(path: string) {
  const content = await readFile(path, 'utf-8')
  return configSchema.parse(JSON.parse(content))
}

const configSchema = z.object({
  host: z.string(),
  username: z.string(),
  device: z.string(),
  mountPath: z.string(),
  phrase: z.string(),
  filesToCheck: z.array(z.string()),
})

type Config = z.infer<typeof configSchema>
