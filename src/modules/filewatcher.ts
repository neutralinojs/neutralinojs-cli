import fs from 'fs'
import * as chokidar from 'chokidar'
import * as websocket from './websocket'
import * as config from '../modules/config'
import * as utils from '../utils'

let fileWatcher: ReturnType<typeof chokidar.watch> | null = null

export const start = (): void => {
  startFileWatcher()
}

export const stop = (): void => {
  if (fileWatcher) {
    fileWatcher.close()
  }
}

function startFileWatcher(): void {
  const configObj = config.get()
  const resourcesDir = utils.trimPath(configObj.cli.resourcesPath)

  if (!fs.existsSync(resourcesDir)) {
    return
  }

  const exclude: string[] = [
    '(^|[\\/\\\\])\\..',
    'node_modules.*',
    '^bin.*',
    '.*.log$',
  ]

  if (configObj?.cli?.autoReloadExclude) {
    exclude.push(configObj.cli.autoReloadExclude)
  }

  const watcherOptions = {
    ignoreInitial: true,
    ignored: new RegExp(exclude.join('|')),
  }

  fileWatcher = chokidar
    .watch(resourcesDir, watcherOptions)
    .on('all', (event: string) => {
      if (['unlink', 'unlinkDir'].includes(event)) {
        return
      }

      websocket.dispatch('neuDev_reloadApp')
    })
}
