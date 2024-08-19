const process = require('process');
const fs = require('fs');
const fse = require('fs-extra');
const config = require('../modules/config');
const downloader = require('./downloader');
const frontendlib = require('../modules/frontendlib');
const projectRunner = require('../modules/projectRunner');
const utils = require('../utils');

module.exports.createApp = async (binaryName, template) => {
    if (fs.existsSync(`./${binaryName}`)) {
        utils.error('App name already exists');
        process.exit(1);
    }
    if(!template) {
        template = 'neutralinojs/neutralinojs-minimal';
    }

    utils.log(`Checking if ${template} is a valid Neutralinojs app template...`);

    const isValidTemplate = await downloader.isValidTemplate(template);
    if(!isValidTemplate) {
        utils.error(`${template} is not a valid Neutralinojs app template.`);
        process.exit(1);
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
        fse.removeSync(`../${binaryName}`);
        process.exit(1);
    }

    config.update('cli.binaryName', binaryName);
    config.update('modes.window.title', binaryName);

    if(frontendlib.containsFrontendLibApp()) {
        await frontendlib.runCommand('initCommand');
    }

    if(projectRunner.containsRunnerApp()) {
        await projectRunner.runCommand('initCommand');
    }

    console.log('-------');
    utils.log(`Enter 'cd ${binaryName} && neu run' to run your application.`);
}
