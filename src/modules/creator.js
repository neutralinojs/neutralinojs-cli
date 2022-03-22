const process = require('process');
const fs = require('fs');
const config = require('../modules/config');
const downloader = require('./downloader');
const utils = require('../utils');

module.exports.createApp = async (binaryName, template) => {
    if(!template) {
        template = 'neutralinojs/neutralinojs-minimal';
    }
    utils.log(`Downloading ${template} template to ${binaryName} directory...`);

    fs.mkdirSync(binaryName, { recursive: true });
    process.chdir(binaryName); // Change the path context for the following methods

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

    utils.log(`Run 'cd ${binaryName} && neu run' to run your application.`);
}
