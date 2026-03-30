import { Command } from 'commander'
import * as creator from '../modules/creator'
import * as utils from '../utils'

interface CreateOptions {
  template?: string
}

export const register = (program: Command): void => {
  program
    .command('create <binaryName>')
    .description(
      'creates an app based on template (neutralinojs/neutralinojs-minimal by default)',
    )
    .option('-t, --template [template]')
    .action(async (binaryName: string, command: CreateOptions) => {
      await creator.createApp(binaryName, command.template)
      utils.showArt()
    })
}
