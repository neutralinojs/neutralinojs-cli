import { Command } from 'commander'
import * as utils from '../utils'
import * as bundler from '../modules/bundler'
import * as config from '../modules/config'
import * as constants from '../constants'

interface BuildOptions {
  release?: boolean
  embedResources?: boolean
  configFile?: string
  copyStorage?: boolean
  clean?: boolean
  macosBundle?: boolean
}

export const register = (program: Command): void => {
  program
    .command('build')
    .description(
      'builds binaries for all supported platforms and resources.neu file',
    )
    .option('-r, --release')
    .option('--embed-resources', 'embed resources in the binary')
    .option('--config-file <path>', 'specify the *.config.json file')
    .option('--copy-storage')
    .option('--clean')
    .option('--macos-bundle')
    .action(async (command: BuildOptions) => {
      if (command.configFile) {
        utils.log(`Using config file: ${command.configFile}`)
        ;(constants.files as any).configFile = command.configFile
      }

      utils.checkCurrentProject()

      const configObj = config.get()
      const buildDir = configObj.cli?.distributionPath
        ? utils.trimPath(configObj.cli.distributionPath)
        : 'dist'

      if (command.clean) {
        utils.log(`Cleaning previous build files from ${buildDir}...`)
        utils.clearDirectory(buildDir)
      }

      utils.log('Bundling app...')

      await bundler.bundleApp({
        release: command.release,
        embedResources: command.embedResources,
        copyStorage: command.copyStorage,
        macosBundle: command.macosBundle,
      })

      utils.showArt()
      utils.log(
        `Application package was generated at the ${buildDir} directory!`,
      )
      utils.log(
        'Distribution guide: https://neutralino.js.org/docs/distribution/overview',
      )
    })
}
