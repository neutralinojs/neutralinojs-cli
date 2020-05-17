
const path = require('path');
const { exec } = require('child_process');
const package = require('../../package.json');
const NEU_ROOT = path.join(__dirname, '../../');
const Configstore = require('configstore');
const config = new Configstore(package.name);

module.exports.registerPlugins = (program, modules) => {
    if(!config.has('plugins'))
        return;
    for(let pluginName of config.get('plugins')) {
        try {
            let plugin = require(pluginName);
            if(plugin.register && plugin.command)
                plugin.register(program.command(plugin.command), modules);
            else
                console.log(`ERROR: ${pluginName} plugin should export command and register properties.`);
        }
        catch(e) {
            console.error(`ERROR: Unable to load ${pluginName} plugin.`);
        }
    }
}

module.exports.add = (packageName, installSuccessCallback) => {
    let plugins = [];
    if(config.has('plugins'))
        plugins = config.get('plugins');
    if(!plugins.includes(packageName)) {
        exec(`cd ${NEU_ROOT} && npm install --save ${packageName}`, (err, stdout, stderr) => {
            if (err) {
                console.error(stderr);
                return;
            }
            else {
                plugins.push(packageName);
                config.set('plugins', plugins);
                if(installSuccessCallback)
                    installSuccessCallback();
            }
        });
    }
    else {
        console.error(`${packageName} is already installed!`);
    }
};

module.exports.remove = (packageName, uninstallSuccessCallback) => {
    let plugins = [];
    if(config.has('plugins'))
        plugins = config.get('plugins');
    if(plugins.includes(packageName)) {
        exec(`cd ${NEU_ROOT} && npm uninstall --save ${packageName}`, (err, stdout, stderr) => {
            if (err) {
                console.error(stderr);
                return;
            }
            else {
                plugins.splice(plugins.indexOf(packageName), 1);
                config.set('plugins', plugins);
                if(uninstallSuccessCallback)
                    uninstallSuccessCallback();
            }
        });
    }
    else {
        console.error(`Unable to find ${packageName}!`);
    }
};

module.exports.list = () => {
    if(config.has('plugin'))
        return;
    for(let plugin of config.get('plugins'))
        console.log(plugin);
}