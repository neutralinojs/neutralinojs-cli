const fs = require('fs');
const fse = require('fs-extra');
const process = require('process');
const figlet = require('figlet');
const chalk = require('chalk');
const constants = require('./constants');
const CONFIG_FILE = constants.files.configFile;
const validator = require('is-my-json-valid')

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
    const config = fs.readFileSync(CONFIG_FILE);
    try {
        JSON.parse(config);
    } catch (error) {
        error(`${CONFIG_FILE} is not a valid JSON File.`);
        process.exit(1);
    }
    const validate = validator({
        required: true,
        type: 'object',
        properties: {
            applicationId: {
                required: true,
                type: 'string'
            },
            url: {
                required: true,
                type: 'string'
            },
            defaultMode: {
                required: true,
                type: 'string'
            },
        }
    })
    if (!validate(JSON.parse(config))) {
        error(`Invalid ${CONFIG_FILE}. applicationId, url, defaultMode are required properties in configuration file.`);
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
    log,
    warn,
    trimPath,
    getVersionTag,
    clearDirectory
}
