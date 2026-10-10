import { unknownErrorToPlainObject } from './errors'

export async function isProcessRunning(pid: number): Promise<boolean> {
  console.log(`Checking if process with pid ${pid} is running`)
  try {
    // signal 0 does not stop the process, it only checks that it exists
    process.kill(pid, 0)
    console.log(`Process with pid ${pid} is running`)
    return true
  } catch (e) {
    // EPERM: the process exists but belongs to another user
    if ((e as NodeJS.ErrnoException).code === 'EPERM') return true
    if ((e as NodeJS.ErrnoException).code !== 'ESRCH')
      console.log('Failed to check if process is running', unknownErrorToPlainObject(e))
    return false
  }
}
