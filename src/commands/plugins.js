const pluginloader = require('../plugins/pluginloader');

module.exports.register = (program) => {
    program
        .command('plugins [plugin]')
        .option('-a, --add')
        .option('-r, --remove')
        .action((plugin, command) => {
            if(plugin) {
                if(command.add)
                    pluginloader.add(plugin, () => {
                        console.log(`${plugin} was installed!`);
                    });
                else if(command.remove)
                    pluginloader.remove(plugin, () => {
                        console.log(`${plugin} was uninstalled!`);
                    });
            }
            else
                pluginloader.list(plugin);
        });
}

