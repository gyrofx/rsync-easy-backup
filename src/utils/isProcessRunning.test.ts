import { describe, expect, it } from 'bun:test'
import { isProcessRunning } from './isProcessRunning'

describe('isProcessRunning', () => {
  it('finds a running process', async () => {
    expect(await isProcessRunning(process.pid)).toBe(true)
  })

  it('does not find a finished process', async () => {
    const child = Bun.spawn(['true'])
    await child.exited
    expect(await isProcessRunning(child.pid)).toBe(false)
  })
})
