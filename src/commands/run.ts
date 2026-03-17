import { Command } from 'commander'
import * as filewatcher from '../modules/filewatcher'
import * as websocket from '../modules/websocket'
import * as runner from '../modules/runner'
import * as utils from '../utils'
import * as config from '../modules/config'
import * as frontendlib from '../modules/frontendlib'
import * as hostproject from '../modules/hostproject'

interface RunOptions {
  disableAutoReload?: boolean
  arch?: string
}

function wrapWithQuotes(arg: string): string {
  if (arg.includes(' ') && !arg.startsWith('"') && !arg.endsWith('"')) {
    return `"${arg}"`
  }
  return arg
}

export const register = (program: Command): void => {
  program
    .command('run')
    .description('fetches config from neutralino.config.json & runs the app')
    .option('--disable-auto-reload')
    .option('--arch <arch>')
    .action(async (command: RunOptions) => {
      utils.checkCurrentProject()
      const configObj = config.get()

      if (hostproject.hasHostProject()) {
        return hostproject.runCommand('devCommand')
      }

      const containsFrontendLibApp = frontendlib.containsFrontendLibApp()
      let argsOpt = ''

      websocket.start({
        frontendLibDev: !!(
          containsFrontendLibApp && configObj.cli?.frontendLibrary?.patchFile
        ),
      })

      if (containsFrontendLibApp) {
        frontendlib.runCommand('devCommand')
        await frontendlib.waitForFrontendLibApp()
      }

      if (!command.disableAutoReload && !containsFrontendLibApp) {
        argsOpt += '--neu-dev-auto-reload'
        filewatcher.start()
      }

      const parseStopIndex = process.argv.indexOf('--')
      if (parseStopIndex !== -1) {
        argsOpt +=
          ' ' +
          process.argv
            .slice(parseStopIndex + 1)
            .map(wrapWithQuotes)
            .join(' ')
      }

      if (containsFrontendLibApp && configObj.cli?.frontendLibrary?.devUrl) {
        argsOpt += ` --url=${configObj.cli.frontendLibrary.devUrl}`
      }

      try {
        await runner.runApp({
          argsOpt,
          arch: command.arch,
        })
      } catch (error: any) {
        utils.log(error)
      }

      filewatcher.stop()
      websocket.stop()
    })
}
