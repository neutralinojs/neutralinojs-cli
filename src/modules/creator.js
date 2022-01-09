const process = require('process');
const fs = require('fs');
const chalk = require('chalk');
const constants = require('../constants');
const config = require('../modules/config');
const downloader = require('./downloader');

module.exports.createApp = async (binaryName, template) => {
    if(!template) {
        template = 'neutralinojs/neutralinojs-minimal';
    }
    console.log(`Downloading ${template} template to ${binaryName} directory...`);

    fs.mkdirSync(binaryName, { recursive: true });
    process.chdir(binaryName); // Change the path context for the following methods

    try {
        await downloader.downloadTemplate(template);
        await downloader.downloadAndUpdateBinaries();
        await downloader.downloadAndUpdateClient();
    }
    catch(err) {
        console.log(`${chalk.bgRed.white('INFO')} Unable to download resources from internet.` +
                    ` Please check your internet connection and template URLs.`);
        process.exit(1);
    }

    config.update('cli.binaryName', binaryName);
    config.update('modes.window.title', binaryName);

    console.log('-------');
    console.log(`Enter 'cd ${binaryName} && neu run' to run your application.`);
}
