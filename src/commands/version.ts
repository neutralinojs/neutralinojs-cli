import { Command } from 'commander'
import * as utils from '../utils'
import * as config from '../modules/config'
import { getRemoteLatestVersion } from '../modules/downloader'
import packageJson from '../../package.json'

export const register = (program: Command): void => {
  program
    .command('version')
    .description('displays global and project specific versions of packages')
    .action(async () => {
      utils.showArt()
      console.log('--- Global ---')

      const isLatestCli = await utils.checkLatestVersion()
      console.log(
        `neu CLI: v${packageJson.version} ${isLatestCli ? '(latest)' : ''}`,
      )

      if (utils.isNeutralinojsProject()) {
        const configObj = config.get()

        const latestBinVersion = await getRemoteLatestVersion('neutralinojs')
        const latestLibVersion = await getRemoteLatestVersion('neutralino.js')

        const clientVersion = configObj.cli?.clientVersion
          ? utils.getVersionTag(configObj.cli.clientVersion)
          : 'Installed from a package manager'

        const latestBin = configObj.cli?.binaryVersion === latestBinVersion
        const latestLib = configObj.cli?.clientVersion
          ? configObj.cli.clientVersion === latestLibVersion
          : null

        console.log(
          `\n--- Project: ${configObj.cli?.binaryName} (${configObj.applicationId}) ---`,
        )
        console.log(
          `Neutralinojs binaries: ${utils.getVersionTag(configObj.cli?.binaryVersion ?? '0.0.0')} ${latestBin ? '(latest)' : ''}`,
        )
        console.log(
          `Neutralinojs client: ${clientVersion} ${latestLib ? '(latest)' : ''}`,
        )

        if (!latestBin || latestLib === false) {
          utils.warn(
            `This project doesn't use the latest Neutralinojs framework. Run ` +
              `'neu update --latest' to download the latest framework binaries and the client library.`,
          )
        }

        if (configObj.version) {
          console.log(`Project version: v${configObj.version}`)
        }
      } else {
        utils.log(
          `Run this command inside your project directory` +
            ` to get project specific Neutralinojs version.`,
        )
      }
    })
}
