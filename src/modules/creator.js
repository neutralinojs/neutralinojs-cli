const { exec } = require('child_process');
const constants = require('../constants');
const commons = require('../commons');
const settings = require('../modules/settings');
const downloader = require('./downloader');

module.exports.createApp = (name, templateName, callback) => {
    if(!templateName)
        templateName = 'blank';
    if (templateName in constants.templates) {
        let template = constants.templates[templateName];
        downloader.downloadTemplate(template, () => {
            console.log('Installing required dependencies...');
            exec(`cd ${name} && npm i`, (err, stdout, stderr) => {
                if (err) {
                    console.error(stderr);
                    return;
                }
                else {
                    downloader.downloadAndUpdateBinaries(() => {
                        settings.update('binaryName', name, name);
                        commons.figlet();
                        console.log(`\n----\nEnter 'cd ${name} && neu build' to build the app.`);
                        if(callback)
                            callback();
                    }, name);
                }
            });
        }, name);
        console.log(`Downloading ${templateName} template to ${name} directory...`);
    }
    else {
        console.log(`Unable to find template ${templateName}`);
    }
}
