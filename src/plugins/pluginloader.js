
const path = require('path');
const { exec } = require('child_process');
const package = require('../../package.json');
const NEU_ROOT = path.join(__dirname, '../../');
const Configstore = require('configstore');
const config = new Configstore(package.name);
const utils = require('../utils');

module.exports.registerPlugins = (program, modules) => {
    if(!config.has('plugins'))
        return;
    for(let pluginName of config.get('plugins')) {
        try {
            let plugin = require(pluginName);
            if(plugin.register && plugin.command)
                plugin.register(program.command(plugin.command), modules);
            else
                utils.error(`Plugin ${pluginName} should export command and register properties.`);
        }
        catch(e) {
            utils.error(`Unable to load ${pluginName} plugin.`);
        }
    }
}

module.exports.add = (packageName) => {
    return new Promise((resolve, reject) => {
        let plugins = [];
        if(config.has('plugins'))
            plugins = config.get('plugins');
        if(!plugins.includes(packageName)) {
            exec(`cd ${NEU_ROOT} && npm install --save ${packageName}`, (err, stdout, stderr) => {
                if (err) {
                    reject(stderr);
                }
                else {
                    plugins.push(packageName);
                    config.set('plugins', plugins);
                    resolve();
                }
            });
        }
        else {
            reject(`${packageName} is already installed!`);
        }
    });
};

module.exports.remove = (packageName, uninstallSuccessCallback) => {
    return new Promise((resolve, reject) => {
        let plugins = [];
        if(config.has('plugins'))
            plugins = config.get('plugins');
        if(plugins.includes(packageName)) {
            exec(`cd ${NEU_ROOT} && npm uninstall --save ${packageName}`, (err, stdout, stderr) => {
                if (err) {
                    reject(stderr);
                }
                else {
                    plugins.splice(plugins.indexOf(packageName), 1);
                    config.set('plugins', plugins);
                    resolve();
                }
            });
        }
        else {
            reject(`Unable to find ${packageName}!`);
        }
    });
};

module.exports.list = () => {
    if(!config.has('plugins'))
        return;
    for(let plugin of config.get('plugins'))
        console.log(plugin);
}
