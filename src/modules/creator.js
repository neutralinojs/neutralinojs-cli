const process = require('process');
const fs = require('fs');
const fse = require('fs-extra');
const config = require('../modules/config');
const downloader = require('./downloader');
const frontendlib = require('../modules/frontendlib');
const utils = require('../utils');

module.exports.createApp = async (binaryName, template, proxy) => {
    if (fs.existsSync(`./${binaryName}`)) {
        utils.error('App name already exists');
        process.exit(1);
    }
    if (!template) {
        template = 'neutralinojs/neutralinojs-minimal';
    }
    utils.log(`Downloading ${template} template to ${binaryName} directory...`);

    fs.mkdirSync(binaryName, { recursive: true });
    process.chdir(binaryName); // Change the path context for the following methods

    try {
        // Pass proxy information to downloader functions
        await downloader.downloadTemplate(template, proxy);
        await downloader.downloadAndUpdateBinaries(false, proxy);
        await downloader.downloadAndUpdateClient(false, proxy);
    } catch (err) {
        utils.error('Unable to download resources from the internet.' +
            ' Please check your internet connection and template URLs.');
        fse.removeSync(`../${binaryName}`);
        process.exit(1);
    }

    config.update('cli.binaryName', binaryName);
    config.update('modes.window.title', binaryName);

    if (frontendlib.containsFrontendLibApp()) {
        await frontendlib.runCommand('initCommand');
    }

    console.log('-------');
    utils.log(`Enter 'cd ${binaryName} && neu run' to run your application.`);
}
