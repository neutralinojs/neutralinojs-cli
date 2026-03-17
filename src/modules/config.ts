import editJsonFile from 'edit-json-file'
import * as constants from '../constants'

export interface NeutralinoConfig {
  applicationId: string
  version: string
  defaultMode?: string
  cli: {
    binaryName: string
    resourcesPath: string
    autoReloadExclude?: string
    extensionsPath?: string
    clientLibrary?: string
    binaryVersion?: string
    clientVersion?: string
    distributionPath?: string
    resourcesExclude?: string
    extensionsExclude?: string
    copyItems?: string[]
    frontendLibrary?: {
      patchFile?: string
      devUrl?: string
      projectPath?: string
      waitTimeout?: number
      [key: string]: any
    }
    hostProject?: {
      projectPath?: string
      buildPath?: string
      [key: string]: any
    }
  }
  modes?: {
    window?: {
      icon?: string
    }
  }
  [key: string]: any
}

const getConfigFile = (): string => constants.files.configFile

export const update = (key: string, value: any): void => {
  const file = editJsonFile(getConfigFile())
  file.set(key, value)
  file.save()
}

export const get = (): NeutralinoConfig => {
  const file = editJsonFile(getConfigFile())
  return file.get() as NeutralinoConfig
}
