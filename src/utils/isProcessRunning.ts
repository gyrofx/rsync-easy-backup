import find from 'find-process'

export async function isProcessRunning(pid: number): Promise<boolean> {
  try {
    await find('pid', pid)
    return true
  } catch (e) {
    return false
  }
}
