const fs = require('fs');
const fse = require('fs-extra');
const process = require('process');
const figlet = require('figlet');
const chalk = require('chalk');
const constants = require('./constants');
const CONFIG_FILE = constants.files.configFile;

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
    if(!isNeutralinojsProject()) {
        error(`Unable to find ${CONFIG_FILE}. ` +
                    `Please check whether the current directory has a Neutralinojs project.`);
        process.exit(1);
    }
}

let log = (message) => {
    console.log(`neu: ${chalk.bgGreen.black('INFO')} ${message}`);
}

let warn = (message) => {
    console.warn(`neu: ${chalk.bgYellow.black('WARN')} ${message}`);
}

let trimPath = (path) => {
    return path ? path.replace(/^\//, ''): path;
}

let clearDirectory = (path) => {
    fse.removeSync(path);
}

let getVersionTag = (version) => {
    return version != 'nightly' ? 'v' + version : version;
}

let filterFiles = (src, pattern) => {
    if(!Array.isArray(pattern)) pattern = [pattern];
    const regex = new RegExp(pattern.join('|'));
    const found = src.match(regex);
    return !found;
}

module.exports = {
    error,
    isNeutralinojsProject,
    getFiglet,
    showArt,
    checkCurrentProject,
    log,
    warn,
    trimPath,
    getVersionTag,
    clearDirectory,
    filterFiles
}
