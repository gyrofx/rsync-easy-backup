import find from 'find-process'
import { unknownErrorToPlainObject } from 'utils/errors'

export async function isProcessRunning(pid: number): Promise<boolean> {
  console.log(`Checking if process with pid ${pid} is running`)
  try {
    const result = await find('pid', pid)
    console.log(`Process with pid ${pid} is running`, result)
    return result.length > 0
  } catch (e) {
    console.log("Failed to check if process is running", unknownErrorToPlainObject(e))
    return false
  }
}
