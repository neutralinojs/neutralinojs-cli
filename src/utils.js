const fs = require('fs');
const process = require('process');
const figlet = require('figlet');
const chalk = require('chalk');
const constants = require('./constants');
const CONFIG_FILE = constants.files.configFile;


let error = (message) => {
    console.error(`neu: ${chalk.bgRed.black('ERROR')} ${message}`);
}

let isNeutralinojsProject = () => {
    return fs.existsSync(CONFIG_FILE);
}

let getFiglet = () => {
    return figlet.textSync('Neutralinojs');
}

module.exports.figlet = () => {
    console.log(getFiglet());
}

module.exports.checkCurrentProject = () => {
    if(!isNeutralinojsProject()) {
        error(`Unable to find ${CONFIG_FILE}. ` +
                    `Please check whether the current directory has a Neutralinojs project.`);
        process.exit(1);
    }
}

module.exports.log = (message) => {
    console.log(`neu: ${chalk.bgGreen.black('INFO')} ${message}`);
}

module.exports.warn = (message) => {
    console.warn(`neu: ${chalk.bgYellow.black('WARNING')} ${message}`);
}

module.exports.isNeutralinojsProject = isNeutralinojsProject;
module.exports.getFiglet = getFiglet;
module.exports.error = error;
