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
    console.warn(`neu: ${chalk.bgYellow.black('WARNING')} ${message}`);
}

module.exports.error = error;
module.exports.isNeutralinojsProject = isNeutralinojsProject;
module.exports.getFiglet = getFiglet;
module.exports.showArt = showArt;
module.exports.checkCurrentProject = checkCurrentProject;
module.exports.log = log;
module.exports.warn = warn;
