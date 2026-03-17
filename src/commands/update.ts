import { Command } from 'commander'
import * as utils from '../utils'
import * as downloader from '../modules/downloader'

interface UpdateOptions {
  latest?: boolean
}

export const register = (program: Command): void => {
  program
    .command('update')
    .description(
      'updates neutralinojs binaries, client library, and TypeScript definitions',
    )
    .option('-l, --latest')
    .action(async (command: UpdateOptions) => {
      utils.checkCurrentProject()

      await downloader.downloadAndUpdateBinaries(command.latest)
      await downloader.downloadAndUpdateClient(command.latest)

      utils.showArt()
      utils.log('Run "neu version" to see installed version details.')
    })
}
