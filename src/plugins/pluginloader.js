const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const package = require('../../package.json');
const NEU_ROOT = path.join(__dirname, '../../');
const Configstore = require('configstore');
const config = new Configstore(package.name);
const utils = require('../utils');

module.exports.registerPlugins = async (program, modules) => {
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
            try {
                utils.log(`Attempting to install ${pluginName}`);
                await add(pluginName);
            }
            catch(e) {
                utils.error(e);
            }
        }
    }
}

let add = (pluginName) => {
    return new Promise((resolve, reject) => {
        let plugins = [];
        if(config.has('plugins'))
            plugins = config.get('plugins');
        if(!isPluginInstalled(pluginName)) {
            exec(`cd ${NEU_ROOT} && npm install ${pluginName}`, (err, stdout, stderr) => {
                if(err) {
                    reject(stderr);
                }
                else if(!plugins.includes(pluginName)) {
                    plugins.push(pluginName);
                    config.set('plugins', plugins);
                }
                resolve();
            });
        }
        else {
            reject(`${pluginName} is already installed!`);
        }
    });
};

let isPluginInstalled = (pluginName) => {
    try {
        require.resolve(pluginName);
        return true;
    }
    catch (e) {
        return false;
    }
}


module.exports.addTest = (pluginPath) => {
    let statsObj;
    try {
      statsObj = fs.statSync(pluginPath);
    } catch (e) {
      utils.error(`${e.message}`);

      process.exit(1);
    }

    if (!statsObj.isDirectory() || !fs.existsSync(pluginPath)) {
      utils.error(`${pluginPath} is not a valid path`);

      process.exit(1);
    }

    const packageJson = require(path.join(pluginPath, 'package.json'));
    if (!packageJson) {
      utils.error('Cannot find package.json file');

      process.exit(1);
    }

    const pluginName = packageJson.name;
    if (!pluginName) {
      utils.error('Your plugin has no name. Please add name in package.json');

      process.exit(1);
    }

    return new Promise((resolve, reject) => {
      let plugins = [];
      if (config.has('plugins')) plugins = config.get('plugins');
      if (!isPluginInstalled(pluginName)) {
        exec(`cd ${pluginPath} && npm link`, (err, stdout, stderr) => {
          if (err) {
            reject(stderr);
          } else if (!plugins.includes(pluginName)) {
            plugins.push(pluginName);
            config.set('plugins', plugins);
          }
          resolve();
        });

        exec(
          `cd ${NEU_ROOT} && npm install ${pluginPath}`,
          (err, stdout, stderr) => {
            if (err) {
              reject(stderr);
            } else if (!plugins.includes(pluginName)) {
              plugins.push(pluginName);
              config.set('plugins', plugins);
            }
            resolve();
          }
        );
      } else {
        reject(`${pluginName} is already installed!`);
      }
    });
  };

module.exports.remove = (pluginName, uninstallSuccessCallback) => {
    return new Promise((resolve, reject) => {
        let plugins = [];
        if(config.has('plugins'))
            plugins = config.get('plugins');
        if(plugins.includes(pluginName)) {
            exec(`cd ${NEU_ROOT} && npm uninstall --save ${pluginName}`, (err, stdout, stderr) => {
                if (err) {
                    reject(stderr);
                }
                else {
                    plugins.splice(plugins.indexOf(pluginName), 1);
                    config.set('plugins', plugins);
                    resolve();
                }
            });
        }
        else {
            reject(`Unable to find ${pluginName}!`);
        }
    });
};

module.exports.removeTest = (pluginPath, uninstallSuccessCallback) => {
    let pluginName, packageJson, statsObj;

    try {
      statsObj = fs.statSync(pluginPath);
    } catch (e) {
      pluginName = pluginPath;
    }

    if (!pluginName && (!statsObj || !statsObj.isDirectory() || !fs.existsSync(pluginPath))) {
      utils.error(`${pluginPath} is not a valid file path`);

      process.exit(1);
    } else {
      packageJson = require(path.join(pluginPath, 'package.json'));
      if (!packageJson) {
        utils.error('Cannot find package.json file');

        process.exit(1);
      }

      pluginName = packageJson.name;
      if (!pluginName) {
        utils.error('Your plugin has no name. Please add name in package.json');

        process.exit(1);
      }
    }

    return new Promise((resolve, reject) => {
      let plugins = [];
      if (config.has('plugins')) plugins = config.get('plugins');
      if (plugins.includes(pluginName)) {
        exec(`npm rm -g ${pluginName}`, (err, stdout, stderr) => {
          if (err) {
            reject(stderr);
          } else {
            plugins.splice(plugins.indexOf(pluginName), 1);
            config.set('plugins', plugins);
            resolve();
          }
        });

        exec(
          `cd ${NEU_ROOT} && npm uninstall ${pluginName}`,
          (err, stdout, stderr) => {
            if (err) {
              reject(stderr);
            } else {
              plugins.splice(plugins.indexOf(pluginName), 1);
              config.set('plugins', plugins);
              resolve();
            }
          }
        );
      } else {
        reject(`Unable to find ${pluginName}!`);
      }
    });
  };

module.exports.list = () => {
    if(!config.has('plugins'))
        return;
    for(let plugin of config.get('plugins'))
        console.log(plugin);
}

module.exports.add = add;
