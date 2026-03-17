import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import Configstore from 'configstore'
import * as utils from '../utils'
import packageJson from '../../package.json'

const execAsync = promisify(exec)
const NEU_ROOT = path.join(__dirname, '../../')
const config = new Configstore(packageJson.name)

interface NeutralinoPlugin {
  register?: (command: any, modules: any) => void
  command?: string
}

export const registerPlugins = async (
  program: any,
  modules: any,
): Promise<void> => {
  if (!config.has('plugins')) return

  const plugins = config.get('plugins') as string[]
  for (const pluginName of plugins) {
    try {
      const plugin: NeutralinoPlugin = require(pluginName)
      if (plugin.register && plugin.command) {
        plugin.register(program.command(plugin.command), modules)
      } else {
        utils.error(
          `Plugin ${pluginName} should export command and register properties.`,
        )
      }
    } catch (e) {
      utils.error(`Unable to load ${pluginName} plugin.`)
      try {
        utils.log(`Attempting to install ${pluginName}`)
        await add(pluginName)
      } catch (err: any) {
        utils.error(err)
      }
    }
  }
}

export const add = (pluginName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    let plugins: string[] = []
    if (config.has('plugins')) {
      plugins = config.get('plugins') as string[]
    }

    if (!isPluginInstalled(pluginName)) {
      exec(
        `cd ${NEU_ROOT} && npm install ${pluginName}`,
        (err, stdout, stderr) => {
          if (err) {
            reject(stderr)
          } else {
            if (!plugins.includes(pluginName)) {
              plugins.push(pluginName)
              config.set('plugins', plugins)
            }
            resolve()
          }
        },
      )
    } else {
      reject(`${pluginName} is already installed!`)
    }
  })
}

export const isPluginInstalled = (pluginName: string): boolean => {
  try {
    require.resolve(pluginName)
    return true
  } catch (e) {
    return false
  }
}

export const addTest = async (pluginPath: string): Promise<void> => {
  let statsObj: fs.Stats
  try {
    statsObj = fs.statSync(pluginPath)
  } catch (e: any) {
    utils.error(`${e.message}`)
    process.exit(1)
  }

  if (!statsObj.isDirectory() || !fs.existsSync(pluginPath)) {
    utils.error(`${pluginPath} is not a valid path`)
    process.exit(1)
  }

  const pluginPackageJson = require(path.join(pluginPath, 'package.json'))
  if (!pluginPackageJson) {
    utils.error('Cannot find package.json file')
    process.exit(1)
  }

  const pluginName = pluginPackageJson.name
  if (!pluginName) {
    utils.error('Your plugin has no name. Please add name in package.json')
    process.exit(1)
  }

  let plugins: string[] = []
  if (config.has('plugins')) plugins = config.get('plugins') as string[]

  if (isPluginInstalled(pluginName)) {
    throw `${pluginName} is already installed!`
  }

  try {
    await execAsync(`cd ${pluginPath} && npm link`)
    await execAsync(`cd ${NEU_ROOT} && npm install ${pluginPath}`)

    if (!plugins.includes(pluginName)) {
      plugins.push(pluginName)
      config.set('plugins', plugins)
    }
  } catch (e: any) {
    throw e.stderr || e
  }
}

export const removeTest = async (pluginPath: string): Promise<void> => {
  let pluginName: string | undefined
  let statsObj: fs.Stats | undefined

  try {
    statsObj = fs.statSync(pluginPath)
  } catch (e) {
    pluginName = pluginPath
  }

  if (
    !pluginName &&
    (!statsObj || !statsObj.isDirectory() || !fs.existsSync(pluginPath))
  ) {
    utils.error(`${pluginPath} is not a valid file path`)
    process.exit(1)
  } else if (!pluginName) {
    const pluginPackageJson = require(path.join(pluginPath, 'package.json'))
    if (!pluginPackageJson) {
      utils.error('Cannot find package.json file')
      process.exit(1)
    }

    pluginName = pluginPackageJson.name
    if (!pluginName) {
      utils.error('Your plugin has no name. Please add name in package.json')
      process.exit(1)
    }
  }

  let plugins: string[] = []
  if (config.has('plugins')) plugins = config.get('plugins') as string[]

  if (!plugins.includes(pluginName!)) {
    throw `Unable to find ${pluginName}!`
  }

  try {
    await execAsync(`npm rm -g ${pluginName}`)
    await execAsync(`cd ${NEU_ROOT} && npm uninstall ${pluginName}`)

    plugins.splice(plugins.indexOf(pluginName!), 1)
    config.set('plugins', plugins)
  } catch (e: any) {
    throw e.stderr || e
  }
}

export const remove = (pluginName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    let plugins: string[] = []
    if (config.has('plugins')) {
      plugins = config.get('plugins') as string[]
    }

    if (plugins.includes(pluginName)) {
      exec(
        `cd ${NEU_ROOT} && npm uninstall --save ${pluginName}`,
        (err, stdout, stderr) => {
          if (err) {
            reject(stderr)
          } else {
            plugins.splice(plugins.indexOf(pluginName), 1)
            config.set('plugins', plugins)
            resolve()
          }
        },
      )
    } else {
      reject(`Unable to find ${pluginName}!`)
    }
  })
}

export const list = (): void => {
  if (!config.has('plugins')) return
  const plugins = config.get('plugins') as string[]
  for (const plugin of plugins) {
    console.log(plugin)
  }
}
