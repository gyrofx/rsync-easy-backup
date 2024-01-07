import { millisecondsToSeconds } from 'date-fns'
import { Strategy } from './types'
import { Backup } from './backup'

export function expiredBackups(backups: Backup[], strategies: Strategy[]) {
  const lastKeptBackups: Record<string, Date> = {}

  return backups.filter(({ date }) => {
    const stragety = strategies.find(({ cutOfDate }) => cutOfDate > date)
    if (!stragety) return false

    const lastKeptBackup = lastKeptBackupByStrategy(lastKeptBackups, stragety)

    if (!lastKeptBackup || outsideIntervalByStratgey(lastKeptBackup, date, stragety)) {
      lastKeptBackups[strategyKey(stragety)] = date
      return false
    }

    return true
  })
}

function lastKeptBackupByStrategy(lastKeptBackups: Record<string, Date>, stragety: Strategy) {
  return lastKeptBackups[strategyKey(stragety)]
}

function outsideIntervalByStratgey(lastKeptBackup: Date, date: Date, stragety: Strategy) {
  const diffInSecondsBetweenLastKeptBackupAndCurrentBackup = Math.abs(
    millisecondsToSeconds(date.getTime() - lastKeptBackup.getTime()),
  )

  return diffInSecondsBetweenLastKeptBackupAndCurrentBackup > stragety.cutOfIntervalInSeconds
}

function strategyKey(strategy: Strategy) {
  return `${strategy.afterDays}-${strategy.intervalInDays}`
}
