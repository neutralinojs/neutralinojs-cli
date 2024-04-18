const fs = require('fs');
const fse = require('fs-extra');
const process = require('process');
const figlet = require('figlet');
const chalk = require('chalk');
const constants = require('./constants');
const CONFIG_FILE = constants.files.configFile;
const config = require('./modules/config')
const ora = require('ora')

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

let trimPath = (path) => {
    return path ? path.replace(/^\//, '') : path;
}

let clearDirectory = (path) => {
    fse.removeSync(path);
}

let getVersionTag = (version) => {
    return version != 'nightly' ? 'v' + version : version;
}

const spinner = ora()
spinner.prefixText = '';

const originalConsoleLog = console.log;

console.log = (message) => {
    if (spinner.isSpinning) {
        spinner.prefixText += `${message}\n`;
    } else {
        originalConsoleLog(message);
    }
}

let log = (message) => {
    if(spinner.isSpinning){
        spinner.prefixText += `${chalk.blue(' neu: 🛈')} ${message}\n`;
    } else {
        console.log(`${chalk.blue('neu: 🛈')} ${message}`);
    }
}

let warn = (message) => {
    if(spinner.isSpinning){
        spinner.prefixText += `${chalk.yellow(' neu: ⚠️ ')} ${message}\n`;
    } else {
        console.warn(`${chalk.yellow('neu: ⚠️ ')} ${message}`);
    }
}

let error = (message) => {
    if(spinner.isSpinning){
        spinner.stopAndPersist({
            symbol: chalk.red('neu: 🛇'),
            text: message
        })
    } else {
        console.error(`${chalk.red('neu: 🛇')} ${message}`);
    }
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
    spinner
}