import fs from 'fs'
import fse from 'fs-extra'
import { https } from 'follow-redirects'
import * as zl from 'zip-lib'
import * as constants from '../constants'
import * as config from './config'
import * as utils from '../utils'

let cachedLatestClientVersion: string | null = null

interface GitHubRelease {
  tag_name: string
  [key: string]: any
}

export const getRemoteLatestVersion = (repo: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const opt = {
      headers: { 'User-Agent': 'Neutralinojs CLI' },
    }
    https
      .get(
        constants.remote.releasesApiUrl.replace('{repo}', repo),
        opt,
        response => {
          let body = ''
          response.on('data', data => (body += data))
          response.on('end', () => {
            if (response.statusCode !== 200) {
              return reject()
            }
            try {
              const apiRes: GitHubRelease = JSON.parse(body)
              const version = apiRes.tag_name.replace('v', '')
              resolve(version)
            } catch (e) {
              reject()
            }
          })
          response.on('error', () => reject())
        },
      )
      .on('error', () => reject())
  })
}

const getLatestVersion = (repo: string): Promise<string> => {
  return new Promise(resolve => {
    const fallback = () => {
      utils.warn(
        'Unable to fetch the latest version tag from GitHub. Using nightly releases...',
      )
      resolve('nightly')
    }

    getRemoteLatestVersion(repo)
      .then(version => {
        utils.log(
          `Found the latest release tag ${utils.getVersionTag(version)} for ${repo}...`,
        )
        resolve(version)
      })
      .catch(() => fallback())
  })
}

const getScriptExtension = (): string => {
  const configObj = config.get()
  const clientLibrary = configObj.cli.clientLibrary
  return clientLibrary?.includes('.mjs') ? 'mjs' : 'js'
}

const getBinaryDownloadUrl = async (latest?: boolean): Promise<string> => {
  const configObj = config.get()
  let version = configObj.cli.binaryVersion

  if (!version || latest) {
    version = await getLatestVersion('neutralinojs')
    config.update('cli.binaryVersion', version)
  }
  return constants.remote.binariesUrl.replace(
    /\{tag\}/g,
    utils.getVersionTag(version),
  )
}

const getClientDownloadUrl = async (
  latest?: boolean,
  types: boolean = false,
): Promise<string> => {
  const configObj = config.get()
  let version = configObj.cli.clientVersion

  if (!version || latest) {
    if (cachedLatestClientVersion) {
      version = cachedLatestClientVersion
    } else {
      version = await getLatestVersion('neutralino.js')
    }
    cachedLatestClientVersion = version
    config.update('cli.clientVersion', version)
  }

  const scriptUrl =
    constants.remote.clientUrlPrefix + (types ? 'd.ts' : getScriptExtension())
  return scriptUrl.replace(/\{tag\}/g, utils.getVersionTag(version))
}

const getTypesDownloadUrl = (latest?: boolean): Promise<string> => {
  return getClientDownloadUrl(latest, true)
}

const getRepoNameFromTemplate = (template: string): string => {
  return template.split('/')[1]
}

const downloadBinariesFromRelease = (latest?: boolean): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.mkdirSync('.tmp', { recursive: true })
    const zipFilename = '.tmp/binaries.zip'
    const file = fs.createWriteStream(zipFilename)
    utils.log('Downloading Neutralinojs binaries..')

    getBinaryDownloadUrl(latest).then(url => {
      https
        .get(url, response => {
          const totalSize = parseInt(
            response.headers['content-length'] || '0',
            10,
          )
          const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2)
          let downloadedSize = 0

          response.on('data', chunk => {
            downloadedSize += chunk.length
            if (totalSize && process.stdout.isTTY) {
              const percentage = ((downloadedSize / totalSize) * 100).toFixed(1)
              const downloadSizeMB = (downloadedSize / 1024 / 1024).toFixed(2)
              process.stdout.write(
                `\r    Downloading binaries: ${percentage}% (${downloadSizeMB} of ${totalSizeMB}MB)`,
              )
            }
          })

          response.pipe(file)
          response.on('end', () => {
            if (process.stdout.isTTY) process.stdout.write('\n')
            utils.log('Extracting binaries.zip file...')
            zl.extract(zipFilename, '.tmp/')
              .then(() => resolve())
              .catch((e: any) => reject(e))
          })
        })
        .on('error', err => reject(err))
    })
  })
}

const downloadClientFromRelease = (latest?: boolean): Promise<void> => {
  return new Promise(resolve => {
    fs.mkdirSync('.tmp', { recursive: true })
    const file = fs.createWriteStream('.tmp/neutralino.' + getScriptExtension())
    utils.log('Downloading the Neutralinojs client..')
    getClientDownloadUrl(latest).then(url => {
      https.get(url, response => {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve()
        })
      })
    })
  })
}

const downloadTypesFromRelease = (latest?: boolean): Promise<void> => {
  return new Promise(resolve => {
    fs.mkdirSync('.tmp', { recursive: true })
    const file = fs.createWriteStream('.tmp/neutralino.d.ts')
    utils.log('Downloading the Neutralinojs types..')

    getTypesDownloadUrl(latest).then(url => {
      https.get(url, response => {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve()
        })
      })
    })
  })
}

export const downloadTemplate = (template: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const templateUrl = constants.remote.templateUrl.replace(
      '{template}',
      template,
    )
    fs.mkdirSync('.tmp', { recursive: true })
    const zipFilename = '.tmp/template.zip'
    const file = fs.createWriteStream(zipFilename)
    https.get(templateUrl, response => {
      response.pipe(file)
      response.on('end', () => {
        utils.log('Extracting template zip file...')
        zl.extract(zipFilename, '.tmp/')
          .then(() => {
            fse.copySync(`.tmp/${getRepoNameFromTemplate(template)}-main`, '.')
            utils.clearDirectory('.tmp')
            resolve()
          })
          .catch((e: any) => reject(e))
      })
    })
  })
}

export const downloadAndUpdateBinaries = async (
  latest: boolean = false,
): Promise<void> => {
  await downloadBinariesFromRelease(latest)
  utils.log('Finalizing and cleaning temp. files.')
  if (!fse.existsSync('bin')) {
    fse.mkdirSync('bin')
  }

  const binaries = constants.files.binaries as Record<
    string,
    Record<string, string>
  >
  for (const platform in binaries) {
    for (const arch in binaries[platform]) {
      const binaryFile = binaries[platform][arch]
      if (fse.existsSync(`.tmp/${binaryFile}`)) {
        fse.copySync(`.tmp/${binaryFile}`, `bin/${binaryFile}`)
        if (process.platform !== 'win32' && platform !== 'win32') {
          fse.chmodSync(`bin/${binaryFile}`, '755')
        }
      }
    }
  }

  for (const dependency of constants.files.dependencies) {
    fse.copySync(`.tmp/${dependency}`, `bin/${dependency}`)
  }
  utils.clearDirectory('.tmp')
}

export const downloadAndUpdateClient = async (
  latest: boolean = false,
): Promise<void> => {
  const configObj = config.get()
  if (!configObj.cli.clientLibrary) {
    utils.log(
      `neu CLI won't download the client library -- download @neutralinojs/lib from your Node package manager.`,
    )
    return
  }
  const clientLibrary = utils.trimPath(configObj.cli.clientLibrary)
  await downloadClientFromRelease(latest)
  await downloadTypesFromRelease(latest)
  utils.log('Finalizing and cleaning temp. files...')
  fse.copySync(
    `.tmp/${constants.files.clientLibraryPrefix + getScriptExtension()}`,
    `./${clientLibrary}`,
  )
  fse.copySync(
    `.tmp/neutralino.d.ts`,
    `./${clientLibrary.replace(/[.][a-z]*$/, '.d.ts')}`,
  )
  utils.clearDirectory('.tmp')
}

export const isValidTemplate = (template: string): Promise<boolean> => {
  return new Promise(resolve => {
    const opt = {
      headers: { 'User-Agent': 'Neutralinojs CLI' },
    }

    const fallback = () => {
      utils.warn(
        'Unable to check the template validity via the GitHub API. Assuming that the template is valid...',
      )
      resolve(true)
    }

    https
      .get(
        constants.remote.templateCheckUrl.replace('{template}', template),
        opt,
        (response: any) => {
          response.req.abort()
          if (response.statusCode === 200) {
            resolve(true)
          } else if (response.statusCode === 404) {
            resolve(false)
          } else {
            fallback()
          }
        },
      )
      .on('error', () => {
        fallback()
      })
  })
}
