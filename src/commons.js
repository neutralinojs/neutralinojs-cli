const fs = require('fs');
const process = require('process');
const figlet = require('figlet');
const chalk = require('chalk');
const constants = require('./constants');
const CONFIG_FILE = constants.files.configFile;

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
        console.log(`${chalk.bgRed.white('ERROR')} Unable to find ${CONFIG_FILE}. ` + 
                    `Please check whether the current directory has a Neutralinojs project.`);
        process.exit(1);
    }
}

module.exports.isNeutralinojsProject = isNeutralinojsProject;
module.exports.getFiglet = getFiglet;
