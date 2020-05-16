const constants = require('../contants');

module.exports.registerPlugins = (program, modules) => {
    for(let pluginName of constants.plugins) {
        try {
            let plugin = require(pluginName);
            if(plugin.register && plugin.command)
                plugin.register(program.command(plugin.command), modules);
            else
                console.log('ERROR: Plugin should export command and register properties.');
        }
        catch(e) {
            console.error(`ERROR: Unable to load ${pluginName} plugin.`);
        }
    }
}