import process from 'process'
import path from 'path'
import fs from 'fs'
import * as config from '../modules/config'
import * as downloader from './downloader'
import * as frontendlib from '../modules/frontendlib'
import * as hostproject from './hostproject'
import * as utils from '../utils'

export const createApp = async (
  appPath: string,
  template?: string,
): Promise<void> => {
  const binaryName = path.basename(path.resolve(appPath))

  if (utils.isNeutralinojsProject(appPath)) {
    utils.error(`${appPath} directory already contains a Neutralinojs project.`)
    process.exit(1)
  }

  if (!template) {
    template = 'neutralinojs/neutralinojs-minimal'
  }

  utils.log(`Checking if ${template} is a valid Neutralinojs app template...`)

  const isValidTemplate = await downloader.isValidTemplate(template)
  if (!isValidTemplate) {
    utils.error(`${template} is not a valid Neutralinojs app template.`)
    process.exit(1)
  }

  utils.log(`Downloading ${template} template to ${binaryName} directory...`)

  fs.mkdirSync(appPath, { recursive: true })
  process.chdir(appPath)

  try {
    await downloader.downloadTemplate(template)
    await downloader.downloadAndUpdateBinaries()
    await downloader.downloadAndUpdateClient()
  } catch (err: any) {
    utils.error(
      'Unable to download resources from internet.' +
        ' Please check your internet connection and template URLs.',
    )
    process.exit(1)
  }

  config.update('cli.binaryName', binaryName)
  config.update('modes.window.title', binaryName)

  if (frontendlib.containsFrontendLibApp()) {
    await frontendlib.runCommand('initCommand')
  }

  if (hostproject.hasHostProject()) {
    await hostproject.runCommand('initCommand')
  }

  console.log('-------')
  utils.log(`Enter 'cd ${appPath} && neu run' to run your application.`)
}
