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
                        utils.spinner.start(`Installing ${plugin}..`);
                        command.test
                          ? await pluginloader.addTest(plugin)
                          : await pluginloader.add(plugin);
                        utils.success(
                          `${plugin} was installed! ${command.test ? 'in test mode' : ""}`
                        );
                        utils.stopSpinner()
                    }
                    catch(e) {
                        utils.error(e);
                    }
                }
                else if(command.remove)
                    try {
                        utils.spinner.start(`Uninstalling ${plugin}..`);
                        command.test
                          ? await pluginloader.removeTest(plugin)
                          : await pluginloader.remove(plugin);
                        utils.success(`${plugin} was uninstalled!`);
                        utils.stopSpinner()
                    }
                    catch(e) {
                        utils.error(e);
                    }
            }
            else
                pluginloader.list(plugin);
        });
}

