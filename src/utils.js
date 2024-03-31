const fs = require('fs');
const fse = require('fs-extra');
const process = require('process');
const figlet = require('figlet');
const chalk = require('chalk');
const constants = require('./constants');
const pathModule = require("path");
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

/**
 * Removes the first character in the ``path`` argument if it is a ``/`` character.
 * 
 * ### Example
 * Initial value of ``path`` argument: ``/usr/bin``
 * 
 * Returned value: ``usr/bin``
 * 
 * @param {string} path 
 * @returns 
 */
let trimPath = (path) => {
    return path ? path.replace(/^\//, ''): path;
}

let clearDirectory = (path) => {
    fse.removeSync(path);
}

let getVersionTag = (version) => {
    return version != 'nightly' ? 'v' + version : version;
}

let getNeutralinoIconFilePath = () =>
{
    // Note: This code might have to be adapted if the location of this file changes (i.e. it is
    // placed into another folder at a different path).
    let srcFolderPath = __dirname;
    let neutralinoIconFilePath = pathModule.resolve(
        srcFolderPath,
        "..",
        "images",
        "logo.png"
    );
    return neutralinoIconFilePath;
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
    getNeutralinoIconFilePath
}
