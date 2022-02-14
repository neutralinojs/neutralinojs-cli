const pluginloader = require('../plugins/pluginloader');
const utils = require('../utils');

module.exports.register = (program) => {
    program
        .command('plugins [plugin]')
        .option('-a, --add')
        .option('-r, --remove')
        .action(async (plugin, command) => {
            if(plugin) {
                if(command.add) {
                    try {
                        utils.log(`Installing ${plugin}..`);
                        await pluginloader.add(plugin);
                        utils.log(`${plugin} was installed!`);
                    }
                    catch(e) {
                        utils.error(e);
                    }
                }
                else if(command.remove)
                    try {
                        utils.log(`Uninstalling ${plugin}..`);
                        await pluginloader.remove(plugin);
                        utils.log(`${plugin} was uninstalled!`);
                    }
                    catch(e) {
                        utils.error(e);
                    }
            }
            else
                pluginloader.list(plugin);
        });
}

