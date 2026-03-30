import fs from 'fs'
import fse from 'fs-extra'
import process from 'process'
import { exec } from 'child_process'
import chalk from 'chalk'
import * as constants from './constants'
import * as config from './modules/config'
import packageJson from '../package.json'

const CONFIG_FILE = constants.files.configFile

export const error = (message: string): void => {
  console.error(`neu: ${chalk.bgRed.black('ERRR')} ${message}`)
}

export const isNeutralinojsProject = (parent: string = '.'): boolean => {
  return fs.existsSync(`${parent}/${CONFIG_FILE}`)
}

export const getFiglet = (): string => {
  return `  _   _            _             _ _             _
 | \\ | | ___ _   _| |_ _ __ __ _| (_)_ __   ___ (_)___
 |  \\| |/ _ \\ | | | __| '__/ _' | | | '_ \\ / _ \\| / __|
 | |\\  |  __/ |_| | |_| | | (_| | | | | | | (_) | \\__ \\
 |_| \\_|\\___|\\__,_|\\__|_|  \\__,_|_|_|_| |_|\\___// |___/
                                               |__/`
}

export const showArt = (): void => {
  console.log(getFiglet())
}

export const checkCurrentProject = (): void => {
  if (!isNeutralinojsProject()) {
    error(
      `Unable to find ${CONFIG_FILE}. ` +
        `Please check whether the current directory has a Neutralinojs project.`,
    )
    process.exit(1)
  }
  const configObj = config.get()
  if (Object.keys(configObj).length == 0) {
    error(`${CONFIG_FILE} is not a valid Neutralinojs configuration JSON file.`)
    process.exit(1)
  }
}

export const checkLatestVersion = (): Promise<boolean> => {
  return new Promise(resolve => {
    exec(`npm view ${packageJson.name} version`, (err, versionInfo) => {
      const latestVersion = versionInfo ? versionInfo.trim() : ''
      if (!err && packageJson.version !== latestVersion) {
        warn(
          `You are using an older neu CLI version. Install the latest version ` +
            `by entering 'npm install -g ${packageJson.name}'`,
        )
        resolve(false)
      }
      resolve(true)
    })
  })
}

export const log = (message: string): void => {
  console.log(`neu: ${chalk.bgGreen.black('INFO')} ${message}`)
}

export const warn = (message: string): void => {
  console.warn(`neu: ${chalk.bgYellow.black('WARN')} ${message}`)
}

export const trimPath = (path: string): string => {
  return path ? path.replace(/^\//, '') : path
}

export const clearDirectory = (path: string): void => {
  fse.removeSync(path)
}

export const getVersionTag = (version: string): string => {
  return version !== 'nightly' ? 'v' + version : version
}

export const filterFiles = (
  src: string,
  pattern: string | string[],
): boolean => {
  if (!Array.isArray(pattern)) pattern = [pattern]
  const regex = new RegExp(pattern.join('|'))
  const found = src.match(regex)
  return !found
}
