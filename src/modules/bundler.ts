import fse from 'fs-extra'
import fs from 'fs'
import * as zl from 'zip-lib'
import asar from '@electron/asar'
import { inject } from 'postject'
import * as config from './config'
import * as constants from '../constants'
import * as frontendlib from './frontendlib'
import * as hostproject from './hostproject'
import * as utils from '../utils'
import { patchWindowsExecutable } from './exepatch'

interface BundleOptions {
  release?: boolean
  embedResources?: boolean
  copyStorage?: boolean
  macosBundle?: boolean
}

async function createAsarFile(): Promise<void> {
  utils.log(`Generating ${constants.files.resourceFile}...`)
  const configObj = config.get()
  const resourcesDir = utils.trimPath(configObj.cli.resourcesPath)
  const extensionsDir = utils.trimPath(configObj.cli.extensionsPath ?? '')
  const clientLibrary = configObj.cli.clientLibrary
    ? utils.trimPath(configObj.cli.clientLibrary)
    : null
  const icon = utils.trimPath(configObj.modes?.window?.icon ?? '')
  const binaryName = configObj.cli.binaryName
  const buildDir = configObj.cli.distributionPath
    ? utils.trimPath(configObj.cli.distributionPath)
    : 'dist'

  fs.mkdirSync(`.tmp`, { recursive: true })
  await fse.copy(`./${resourcesDir}`, `.tmp/${resourcesDir}`, {
    overwrite: true,
    filter: (src: string) => {
      if (!configObj.cli.resourcesExclude) return true
      return !new RegExp(configObj.cli.resourcesExclude).test(src)
    },
  })

  if (extensionsDir && fs.existsSync(extensionsDir)) {
    await fse.copy(
      `./${extensionsDir}`,
      `${buildDir}/${binaryName}/${extensionsDir}`,
      {
        overwrite: true,
        filter: (src: string) => {
          if (!configObj.cli.extensionsExclude) return true
          return !new RegExp(configObj.cli.extensionsExclude).test(src)
        },
      },
    )
  }

  await fse.copy(
    `${constants.files.configFile}`,
    `.tmp/neutralino.config.json`,
    { overwrite: true },
  )

  if (clientLibrary) {
    const typesFile = clientLibrary.replace(/.js$/, '.d.ts')
    await fse.copy(`./${clientLibrary}`, `.tmp/${clientLibrary}`, {
      overwrite: true,
    })
    if (fs.existsSync(`.tmp/${typesFile}`)) {
      fse.removeSync(`.tmp/${typesFile}`)
    }
  }

  if (icon) {
    await fse.copy(`./${icon}`, `.tmp/${icon}`, { overwrite: true })
  }

  let resourceFile: string = constants.files.resourceFile
  if (hostproject.hasHostProject()) {
    resourceFile = `bin/${resourceFile}`
  }
  await asar.createPackage('.tmp', `${buildDir}/${binaryName}/${resourceFile}`)
}

function patchMachoUniversalSentinel(
  binaryPath: string,
  isBeforeInjection: boolean,
): void {
  try {
    const sentinelFuse = constants.embedded.options.sentinelFuse
    const fixSentinelFuse = constants.embedded.fixSentinelFuse

    const binaryFile = fs.readFileSync(binaryPath)
    const buffer = Buffer.from(binaryFile.buffer)

    const firstSentinel = buffer.indexOf(
      isBeforeInjection ? sentinelFuse : fixSentinelFuse,
    )
    const lastSentinel = buffer.lastIndexOf(sentinelFuse)

    if (isBeforeInjection) {
      if (firstSentinel === -1 || lastSentinel === -1) {
        throw new Error('Two Sentinels are needed. None were found.')
      }
      if (firstSentinel === lastSentinel) {
        throw new Error('Two Sentinels are needed. Only one was found.')
      }
      buffer[firstSentinel] = fixSentinelFuse[0].charCodeAt(0)
    } else {
      buffer[firstSentinel] = sentinelFuse[0].charCodeAt(0)
      const colonIndex = firstSentinel + fixSentinelFuse.length
      if (buffer[colonIndex] !== ':'.charCodeAt(0)) {
        throw new Error(`Value at index ${colonIndex} must be ':'`)
      }

      const hasResourceIndex = colonIndex + 1
      const hasResourceValue = buffer[hasResourceIndex]
      if (
        hasResourceValue !== '0'.charCodeAt(0) &&
        hasResourceValue !== '1'.charCodeAt(0)
      ) {
        throw new Error(`Value at index ${hasResourceIndex} must be '0' or '1'`)
      }

      buffer[hasResourceIndex] = '1'.charCodeAt(0)
    }

    fse.writeFileSync(binaryPath, buffer)
  } catch (error: any) {
    throw new Error(
      'Error patching Mach-O universal sentinel: ' + error.message,
    )
  }
}

export const bundleApp = async (options: BundleOptions = {}): Promise<void> => {
  const configObj = config.get()
  const binaryName = configObj.cli.binaryName
  const buildDir = configObj.cli.distributionPath
    ? utils.trimPath(configObj.cli.distributionPath)
    : 'dist'
  const hostProjectConfig = configObj.cli?.hostProject

  try {
    if (frontendlib.containsFrontendLibApp()) {
      await frontendlib.runCommand('buildCommand')
    }

    if (hostproject.hasHostProject()) {
      await hostproject.runCommand('buildCommand')
    }

    await createAsarFile()
    utils.log('Copying binaries...')

    const resourcePath = hostproject.hasHostProject()
      ? `${buildDir}/${binaryName}/bin/${constants.files.resourceFile}`
      : `${buildDir}/${binaryName}/${constants.files.resourceFile}`

    const resourceData = fse.readFileSync(resourcePath)

    for (const platform in constants.files.binaries) {
      const platformBinaries = (constants.files.binaries as any)[platform]
      for (const arch in platformBinaries) {
        const originalBinaryFile = platformBinaries[arch]
        const destinationBinaryFile = hostproject.hasHostProject()
          ? `bin/${originalBinaryFile}`
          : originalBinaryFile.replace('neutralino', binaryName)

        const destinationFullPath = `${buildDir}/${binaryName}/${destinationBinaryFile}`

        if (fse.existsSync(`bin/${originalBinaryFile}`)) {
          fse.copySync(`bin/${originalBinaryFile}`, destinationFullPath)

          if (options.embedResources) {
            if (platform === 'darwin' && arch === 'universal') {
              patchMachoUniversalSentinel(destinationFullPath, true)
            }

            utils.log(`Embedding resources to ${destinationBinaryFile}...`)

            await inject(
              destinationFullPath,
              constants.embedded.resourceName,
              resourceData,
              constants.embedded.options as any,
            )

            if (platform === 'darwin' && arch === 'universal') {
              patchMachoUniversalSentinel(destinationFullPath, false)
            }
          }
        }
      }
    }

    utils.log('Patching windows executables...')
    try {
      const winBinaries = constants.files.binaries.win32 as Record<
        string,
        string
      >
      await Promise.all(
        Object.keys(winBinaries).map(async arch => {
          const origBinaryName = winBinaries[arch]
          const filepath = hostproject.hasHostProject()
            ? `bin/${origBinaryName}`
            : origBinaryName.replace('neutralino', binaryName)
          const winPath = `${buildDir}/${binaryName}/${filepath}`

          if (await fse.pathExists(winPath)) {
            await patchWindowsExecutable(winPath)
          }
        }),
      )
    } catch (err) {
      utils.error('Could not patch windows executable')
      process.exit(1)
    }

    for (const dependency of constants.files.dependencies) {
      fse.copySync(
        `bin/${dependency}`,
        `${buildDir}/${binaryName}/${dependency}`,
      )
    }

    if (options.copyStorage) {
      utils.log('Copying storage data...')
      try {
        fse.copySync('.storage', `${buildDir}/${binaryName}/.storage`)
      } catch (err) {
        utils.error('Unable to copy storage data')
        process.exit(1)
      }
    }

    if (hostproject.hasHostProject() && hostProjectConfig?.buildPath) {
      utils.log('Copying host project files...')
      fse.copySync(
        utils.trimPath(hostProjectConfig.buildPath),
        `${buildDir}/${binaryName}/`,
      )
    }

    if (configObj.cli.copyItems && Array.isArray(configObj.cli.copyItems)) {
      utils.log('Copying additional app package items...')
      for (const item of configObj.cli.copyItems) {
        await fse.copy(`./${item}`, `${buildDir}/${binaryName}/${item}`)
      }
    }

    if (options.macosBundle) {
      utils.log('Creating MacOS app bundles...')
      for (const macBinary of Object.values(
        constants.files.binaries.darwin,
      ) as string[]) {
        const finalBinaryName = hostproject.hasHostProject()
          ? `bin/${macBinary}`
          : macBinary.replace('neutralino', binaryName)

        fs.renameSync(
          `${buildDir}/${binaryName}/${finalBinaryName}`,
          `${buildDir}/${binaryName}/${finalBinaryName}.app`,
        )
      }
    }

    if (options.release) {
      utils.log('Making app bundle ZIP file...')
      await zl.archiveFolder(
        `${buildDir}/${binaryName}`,
        `${buildDir}/${binaryName}-release.zip`,
      )
    }

    utils.clearDirectory('.tmp')
    if (options.embedResources) {
      fse.removeSync(
        `${buildDir}/${binaryName}/${constants.files.resourceFile}`,
      )
    }
  } catch (e: any) {
    utils.error(e.message.replace(/^Error: /g, ''))
  }
}
