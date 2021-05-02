const constants = require('../constants');
const commons = require('../commons');
const settings = require('../modules/settings');
const downloader = require('./downloader');

module.exports.createApp = (binaryName, templateName, callback) => {
    if(!templateName)
        templateName = 'minimal';
    if (templateName in constants.templates) {
        let template = constants.templates[templateName];
        downloader.downloadTemplate(template, () => {
            console.log('Installing required dependencies...');
            downloader.downloadAndUpdateBinaries(() => {
                settings.update('cli.binaryName', binaryName, binaryName);
                settings.update('modes.window.title', binaryName, binaryName);
                commons.figlet();
                console.log(`\n----\nEnter 'cd ${binaryName} && neu run' to run your application.`);
                if(callback)
                    callback();
            }, binaryName);
        }, binaryName);
        console.log(`Downloading ${templateName} template to ${binaryName} directory...`);
    }
    else {
        console.log(`Unable to find template: ${templateName}`);
    }
}
