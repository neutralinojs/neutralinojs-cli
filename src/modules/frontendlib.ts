import fs from 'fs'
import process from 'process'
import spawnCommand from 'spawn-command'
import recursive from 'recursive-readdir'
import tpu from 'tcp-port-used'
import * as config from './config'
import * as constants from '../constants'
import * as utils from '../utils'

const HOT_REL_LIB_PATCH_REGEX = constants.misc.hotReloadLibPatchRegex
const HOT_REL_GLOB_PATCH_REGEX = constants.misc.hotReloadGlobPatchRegex

let originalClientLib: string | null = null
let originalGlobals: string | null = null

async function makeClientLibUrl(port: number): Promise<string> {
  const configObj = config.get()
  const resourcesPath = configObj.cli.resourcesPath.replace(/^\//, '')
  const files = await recursive(resourcesPath)

  let clientLib = files.find(file => /neutralino\.js$/.test(file))
  if (clientLib) {
    clientLib = clientLib.replace(/\\/g, '/')
  }

  let url = `http://localhost:${port}`

  if (clientLib) {
    clientLib = '/' + clientLib
    if (configObj.documentRoot) {
      clientLib = clientLib.replace(configObj.documentRoot, '/')
    }
    url += clientLib
  }
  return url
}

function makeGlobalsUrl(port: number): string {
  return `http://localhost:${port}/__neutralino_globals.js`
}

function patchHTMLFile(scriptFile: string, regex: RegExp): string | null {
  const configObj = config.get()

  if (!configObj.cli?.frontendLibrary?.patchFile) {
    return null
  }

  const patchFile = configObj.cli.frontendLibrary.patchFile.replace(/^\//, '')
  let html = fs.readFileSync(patchFile, 'utf8')
  const matches = regex.exec(html)

  if (matches) {
    html = html.replace(regex, `$1${scriptFile}$3`)
    fs.writeFileSync(patchFile, html)
    return matches[2]
  }
  return null
}

function getPortByProtocol(protocol: string): number {
  switch (protocol) {
    case 'http:':
      return 80
    case 'https:':
      return 443
    case 'ftp:':
      return 21
    default:
      return -1
  }
}

export const bootstrap = async (port: number): Promise<void> => {
  const configObj = config.get()

  if (configObj.cli?.clientLibrary) {
    const clientLibUrl = await makeClientLibUrl(port)
    originalClientLib = patchHTMLFile(clientLibUrl, HOT_REL_LIB_PATCH_REGEX)
  }

  const globalsUrl = makeGlobalsUrl(port)
  originalGlobals = patchHTMLFile(globalsUrl, HOT_REL_GLOB_PATCH_REGEX)

  utils.warn(
    'Global variables patch was applied successfully. Please avoid sending keyboard interrupts.',
  )
  utils.log(
    `You are working with your frontend library's development environment. ` +
      'Your frontend-library-based app will run with Neutralino and be able to use the Neutralinojs API.',
  )
}

export const cleanup = (): void => {
  if (originalClientLib) {
    patchHTMLFile(originalClientLib, HOT_REL_LIB_PATCH_REGEX)
  }
  if (originalGlobals) {
    patchHTMLFile(originalGlobals, HOT_REL_GLOB_PATCH_REGEX)
  }
  utils.log('Global variables patch was reverted.')
}

export const runCommand = (commandKey: string): Promise<void> | undefined => {
  const configObj = config.get()
  const frontendLib = configObj.cli?.frontendLibrary

  if (frontendLib?.projectPath && (frontendLib as any)[commandKey]) {
    return new Promise(resolve => {
      const projectPath = utils.trimPath(frontendLib.projectPath!)
      const cmd = (frontendLib as any)[commandKey]

      utils.log(`Running ${commandKey}: ${cmd}...`)
      const proc = spawnCommand(cmd, { stdio: 'inherit', cwd: projectPath })
      proc.on('exit', (code: number | null) => {
        utils.log(
          `frontendlib: ${commandKey} completed with exit code: ${code}`,
        )
        resolve()
      })
    })
  }
}

export const containsFrontendLibApp = (): boolean => {
  const configObj = config.get()
  return !!(configObj.cli && configObj.cli.frontendLibrary)
}

export const waitForFrontendLibApp = async (): Promise<void> => {
  const configObj = config.get()
  const frontendLib = configObj.cli?.frontendLibrary

  if (!frontendLib?.devUrl) {
    return
  }

  const devUrlString = frontendLib.devUrl
  const timeout = frontendLib.waitTimeout || 20000
  const url = new URL(devUrlString)
  const portString = url.port
  const port = portString
    ? Number.parseInt(portString)
    : getPortByProtocol(url.protocol)

  if (port < 0) {
    utils.error(
      `Could not get frontendLibrary port of ${devUrlString} with protocol ${url.protocol}`,
    )
    process.exit(1)
  }

  const inter = setInterval(() => {
    utils.log(
      `App will be launched when ${devUrlString} on port ${port} is ready...`,
    )
  }, 2500)

  try {
    await tpu.waitUntilUsedOnHost(port, url.hostname, 200, timeout)
  } catch (e) {
    utils.error(`Timeout exceeded while waiting till local TCP port: ${port}`)
    process.exit(1)
  }
  clearInterval(inter)
}
