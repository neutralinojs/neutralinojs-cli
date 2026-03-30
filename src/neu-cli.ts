import { Command } from 'commander'
import * as create from './commands/create'
import * as run from './commands/run'
import * as build from './commands/build'
import * as update from './commands/update'
import * as version from './commands/version'
import * as plugins from './commands/plugins'
import * as pluginloader from './plugins/pluginloader'
import * as modules from './modules'

export function bootstrap(program: Command): void {
  create.register(program)
  run.register(program)
  build.register(program)
  update.register(program)
  version.register(program)
  plugins.register(program)
  pluginloader.registerPlugins(program, modules)
}
