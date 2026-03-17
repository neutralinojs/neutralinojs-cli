import spawnCommand from 'spawn-command'
import fs from 'fs'
import path from 'path'
import * as constants from '../constants'
import * as utils from '../utils'

const EXEC_PERMISSION = 0o755

export interface RunOptions {
  arch?: string
  argsOpt?: string
}

function getBinaryName(arch: string): string {
  const platform = process.platform
  const binaries = constants.files.binaries as Record<
    string,
    Record<string, string>
  >

  if (!(platform in binaries)) return ''
  if (!(arch in binaries[platform])) return ''

  return binaries[platform][arch]
}

export const runApp = async (options: RunOptions = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const arch = options.arch || process.arch
    const binaryName = getBinaryName(arch)

    if (!binaryName) {
      return reject(
        `Unsupported platform or CPU architecture: ${process.platform}_${arch}`,
      )
    }

    const binaryPath = `bin${path.sep}${binaryName}`
    let args = ' --load-dir-res --path=. --export-auth-info --neu-dev-extension'

    if (options.argsOpt) {
      args += ' ' + options.argsOpt
    }

    if (process.platform === 'linux' || process.platform === 'darwin') {
      if (fs.existsSync(binaryPath)) {
        fs.chmodSync(binaryPath, EXEC_PERMISSION)
      }
    }

    utils.log(`Starting process: ${binaryName} ${args}`)

    const neuProcess = spawnCommand(binaryPath + args, { stdio: 'inherit' })

    neuProcess.on('exit', (code: number | null) => {
      const statusCodeMsg = code !== null ? `code ${code}` : `signal null`
      const runnerMsg = `${binaryName} was stopped with ${code === 0 ? 'success' : 'error'} ${statusCodeMsg}`

      if (code && code !== 0) {
        utils.warn(runnerMsg)
      } else {
        utils.log(runnerMsg)
      }

      resolve()
    })

    neuProcess.on('error', (err: Error) => {
      utils.error(`Could not start Neutralinojs binary: ${err.message}`)
      reject(err)
    })
  })
}
