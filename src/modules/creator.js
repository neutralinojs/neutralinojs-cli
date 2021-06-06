const constants = require('../constants');
const settings = require('../modules/settings');
const downloader = require('./downloader');

module.exports.createApp = async (binaryName, templateName) => {
    if(!templateName)
        templateName = 'minimal';
    if (templateName in constants.templates) {
        let template = constants.templates[templateName];
        console.log(`Downloading ${templateName} template to ${binaryName} directory...`);
        await downloader.downloadTemplate(template, binaryName);
        
        console.log('Downloading binaries from the latest release...');
        await downloader.downloadAndUpdateBinaries(binaryName);
        
        settings.update('cli.binaryName', binaryName, binaryName);
        settings.update('modes.window.title', binaryName, binaryName);
        
        console.log(`\n----\nEnter 'cd ${binaryName} && neu run' to run your application.`);
    }
    else {
        console.log(`Unable to find template: ${templateName}`);
    }
}
