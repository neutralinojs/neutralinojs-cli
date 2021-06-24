const process = require('process');
const fs = require('fs');
const constants = require('../constants');
const config = require('../modules/config');
const downloader = require('./downloader');

module.exports.createApp = async (binaryName, templateName) => {
    if(!templateName)
        templateName = 'minimal';
    if (templateName in constants.templates) {
        let template = constants.templates[templateName];
        console.log(`Downloading ${templateName} template to ${binaryName} directory...`);
        
        fs.mkdirSync(binaryName, { recursive: true });
        process.chdir(binaryName); // Change the path context for the following methods
        
        await downloader.downloadTemplate(template);
        await downloader.downloadAndUpdateBinaries();
        await downloader.downloadAndUpdateClient();
        
        config.update('cli.binaryName', binaryName);
        config.update('modes.window.title', binaryName);
        
        console.log(`\n----\nEnter 'cd ${binaryName} && neu run' to run your application.`);
    }
    else {
        console.log(`Unable to find template: ${templateName}`);
    }
}
