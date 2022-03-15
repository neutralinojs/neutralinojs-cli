const fs = require('fs');
const process = require('process');
const figlet = require('figlet');
const chalk = require('chalk');
const constants = require('./constants');
const CONFIG_FILE = constants.files.configFile;

module.exports.error = (message) => {
    console.error(`neu: ${chalk.bgRed.black('ERROR')} ${message}`);
}

module.exports.isNeutralinojsProject = () => {
    return fs.existsSync(CONFIG_FILE);
}

module.exports.getFiglet = () => {
    return figlet.textSync('Neutralinojs');
}

module.exports.figlet = () => {
    console.log(figlet.textSync('Neutralinojs'));
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
