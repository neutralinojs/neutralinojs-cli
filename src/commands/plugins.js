const pluginloader = require('../plugins/pluginloader');

module.exports.register = (program) => {
    program
        .command('plugins [plugin]')
        .option('-a, --add')
        .option('-r, --remove')
        .action(async (plugin, command) => {
            if(plugin) {
                if(command.add) {
                    try {
                        console.log(`Installing ${plugin}..`);
                        await pluginloader.add(plugin);
                        console.log(`${plugin} was installed!`);
                    }
                    catch(e) {
                        console.error(e);
                    }
                }
                else if(command.remove)
                    try {
                        console.log(`Installing ${plugin}..`);
                        await pluginloader.remove(plugin);
                        console.log(`${plugin} was uninstalled!`);
                    }
                    catch(e) {
                        console.error(e);
                    }
            }
            else
                pluginloader.list(plugin);
        });
}

