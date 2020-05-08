const { exec } = require('child_process');
const constants = require('../contants');
const clone = require('git-clone');
const commons = require('../commons');
const settings = require('../modules/settings');
const downloader = require('./downloader');

module.exports.createApp = (name, command) => {
    if (command.template in constants.templates) {
        let template = constants.templates[command.template];
        clone(template.githubUrl, `./${name}`, {}, () => {
            exec(`cd ${name} && npm i`, (err, stdout, stderr) => {
                if (err) {
                    console.error(stderr);
                    return;
                }
                else {
                    downloader.downloadAndUpdateBinaries(() => {
                        settings.update('appname', name, name);
                        commons.figlet();
                        console.log(`\n----\nEnter 'cd ${name} && neu build' to build the app.`);
                    }, name);
                }
            });
        });
        console.log(`Downloading app template to ${name}...`);
    }
    else {
        console.log('Unable to find template');
    }
}