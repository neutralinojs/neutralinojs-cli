import spawnCommand from 'spawn-command'
import * as config from './config'
import * as utils from '../utils'

export const hasHostProject = (): boolean => {
  const configObj = config.get()
  return !!(configObj.cli && configObj.cli.hostProject)
}

export const runCommand = async (commandKey: string): Promise<void> => {
  const configObj = config.get()
  const hostProject = configObj.cli?.hostProject

  if (hostProject?.projectPath && (hostProject as any)[commandKey]) {
    return new Promise(resolve => {
      const projectPath = utils.trimPath(hostProject.projectPath!)
      const cmd = (hostProject as any)[commandKey]

      utils.log(`Running ${commandKey}: ${cmd}...`)

      const proc = spawnCommand(cmd, { stdio: 'inherit', cwd: projectPath })

      proc.on('exit', (code: number | null) => {
        utils.log(
          `hostproject: ${commandKey} completed with exit code: ${code}`,
        )
        resolve()
      })
    })
  }
}
