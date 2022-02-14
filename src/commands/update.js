const utils = require('../utils');
const downloader = require('../modules/downloader');

module.exports.register = (program) => {
    program
        .command('update')
        .action(async (name, command) => {
            utils.checkCurrentProject();
            await downloader.downloadAndUpdateBinaries();
            await downloader.downloadAndUpdateClient();

            utils.figlet();
            utils.log('Run "neu version" to see installed version details.');
        });
}

