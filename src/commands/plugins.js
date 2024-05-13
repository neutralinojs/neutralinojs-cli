const pluginloader = require('../plugins/pluginloader');
const utils = require('../utils');

module.exports.register = (program) => {
    program
        .command('plugins [plugin]')
        .description('displays, adds or removes plugins')
        .option('-a, --add')
        .option('-r, --remove')
        .option('-t, --test')
        .action(async (plugin, command) => {
            if(plugin) {
                if(command.add) {
                    try {
                        utils.log(`Installing ${plugin}..`);
                        command.test
                          ? await pluginloader.addTest(plugin)
                          : await pluginloader.add(plugin);
                        utils.log(
                          `${plugin} was installed! ${command.test ? 'in test mode' : ""}`
                        );
                    }
                    catch(e) {
                        utils.error(e);
                    }
                }
                else if(command.remove)
                    try {
                        utils.log(`Uninstalling ${plugin}..`);
                        command.test
                          ? await pluginloader.removeTest(plugin)
                          : await pluginloader.remove(plugin);
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

