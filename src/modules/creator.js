const process = require('process');
const fs = require('fs');
const path = require('path');
const constants = require('../constants');
const config = require('../modules/config');
const downloader = require('./downloader');
const utils = require('../utils');

module.exports.createApp = async (binaryName, projectPath, template) => {
    if(!template) {
        template = 'neutralinojs/neutralinojs-minimal';
    }

    // Get the relative path. if path is '' which means "./" then value should be binary name, else it should be the relative path
    const projectPathRel = path.relative('.', projectPath) ? path.relative('.', projectPath) : binaryName;
    utils.log(`Downloading ${template} template to ${projectPathRel} directory...`);

    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }
    process.chdir(projectPath); // Change the path context for the following methods

    try {
        await downloader.downloadTemplate(template);
        await downloader.downloadAndUpdateBinaries();
        await downloader.downloadAndUpdateClient();
    }
    catch(err) {
        utils.error('Unable to download resources from internet.' +
                    ' Please check your internet connection and template URLs.');
        process.exit(1);
    }

    config.update('cli.binaryName', binaryName);
    config.update('modes.window.title', binaryName);

    console.log('-------');
    utils.log(`Enter 'cd ${projectPathRel} && neu run' to run your application.`);
}
