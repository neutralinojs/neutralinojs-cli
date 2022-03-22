const utils = require('../utils');
const downloader = require('../modules/downloader');

module.exports.register = (program) => {
    program
        .command('update')
        .description('updates neutralinojs binaries and client library')
        .action(async (name, command) => {
            utils.checkCurrentProject();
            await downloader.downloadAndUpdateBinaries();
            await downloader.downloadAndUpdateClient();

            utils.showArt();
            utils.log('Run "neu version" to see installed version details.');
        });
}

