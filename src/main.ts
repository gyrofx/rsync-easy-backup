import { program } from '@commander-js/extra-typings'

import { handleErrorDelicately } from './utils/handleErrorDelicately'
import { rsyncAction } from './rsyncAction'
import { nowUTC } from './utils/nowUTC'
import { parseStrategyOption } from './parseStrategyOption'

async function main() {
  const now = nowUTC()

  await program
    .command('backup')
    .argument('<name>', 'The name of the backup')
    .argument('<source>', 'The soruce of the backup')
    .argument('<destination>', 'The destination of the backup')
    .option(
      '--strategy <strategy>',
      `Set the expiration strategy. Default: "1:1 30:7 365:30" means after one day,
        keep one backup per day. After 30 days, keep one backup every 7 days.
        After 365 days keep one backup every 30 days.`,
      (value) => parseStrategyOption(value, now),
      parseStrategyOption('1:1 30:7 365:30', now)
    )
    .option(
      '--summary-dir <summarydir>',
      `Set the summary dir path. If this flag is set, a JSON file will be created.
      The file contains all the changed file and some statistics.`
    )
    .option(
      '--log-dir <logdir>',
      `Set the log dir path. If this flag is set, a JSON file will be created.
      The file contains all the changed file and some statistics.`
    )
    .action(rsyncAction)
    .parseAsync()
}

process.on('unhandledRejection', handleErrorDelicately)

main()
  .then(() => console.log('done'))
  .catch(handleErrorDelicately)
