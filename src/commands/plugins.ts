import { Command } from 'commander'
import * as pluginloader from '../plugins/pluginloader'
import * as utils from '../utils'

interface PluginsOptions {
  add?: boolean
  remove?: boolean
  test?: boolean
}

export const register = (program: Command): void => {
  program
    .command('plugins [plugin]')
    .description('displays, adds or removes plugins')
    .option('-a, --add')
    .option('-r, --remove')
    .option('-t, --test')
    .action(async (plugin: string | undefined, command: PluginsOptions) => {
      if (plugin) {
        if (command.add) {
          try {
            utils.log(`Installing ${plugin}..`)
            if (command.test) {
              await pluginloader.addTest(plugin)
            } else {
              await pluginloader.add(plugin)
            }
            utils.log(
              `${plugin} was installed! ${command.test ? 'in test mode' : ''}`,
            )
          } catch (e: any) {
            utils.error(e)
          }
        } else if (command.remove) {
          try {
            utils.log(`Uninstalling ${plugin}..`)
            if (command.test) {
              await pluginloader.removeTest(plugin)
            } else {
              await pluginloader.remove(plugin)
            }
            utils.log(`${plugin} was uninstalled!`)
          } catch (e: any) {
            utils.error(e)
          }
        }
      } else {
        pluginloader.list()
      }
    })
}
