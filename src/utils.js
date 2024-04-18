const fs = require('fs');
const fse = require('fs-extra');
const process = require('process');
const figlet = require('figlet');
const chalk = require('chalk');
const constants = require('./constants');
const CONFIG_FILE = constants.files.configFile;
const config = require('./modules/config')
const package = require('../package.json')

let error = (message) => {
    console.error(`neu: ${chalk.bgRed.black('ERRR')} ${message}`);
}

let isNeutralinojsProject = () => {
    return fs.existsSync(CONFIG_FILE);
}

let getFiglet = () => {
    return figlet.textSync('Neutralinojs');
}

let showArt = () => {
    console.log(getFiglet());
}

let checkCurrentProject = () => {
    if (!isNeutralinojsProject()) {
        error(`Unable to find ${CONFIG_FILE}. ` +
            `Please check whether the current directory has a Neutralinojs project.`);
        process.exit(1);
    }
    const configObj =  config.get();
    if(Object.keys(configObj).length == 0) {
        error(`${CONFIG_FILE} is not a valid Neutralinojs configuration JSON file.`);
        process.exit(1);
    }
}

let checkLatestVersion = async () => {
    try {
        const response = await fetch(`https://registry.npmjs.org/${package.name}`);
        if (!response.ok) {
            error(`HTTP error! Status: ${response.status}`);
        }     
        const data = await response.json();
        const versionsArray = Object.keys(data.time);
        const latestVersion = versionsArray[versionsArray.length - 1];       
        if (package.version !== latestVersion) {
            warn(`Please update to the latest version: ${latestVersion}`);
        } else {
            return;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


let log = (message) => {
    console.log(`neu: ${chalk.bgGreen.black('INFO')} ${message}`);
}

let warn = (message) => {
    console.warn(`neu: ${chalk.bgYellow.black('WARN')} ${message}`);
}

let trimPath = (path) => {
    return path ? path.replace(/^\//, '') : path;
}

let clearDirectory = (path) => {
    fse.removeSync(path);
}

let getVersionTag = (version) => {
    return version != 'nightly' ? 'v' + version : version;
}

module.exports = {
    error,
    isNeutralinojsProject,
    getFiglet,
    showArt,
    checkCurrentProject,
    checkLatestVersion,
    log,
    warn,
    trimPath,
    getVersionTag,
    clearDirectory
}
