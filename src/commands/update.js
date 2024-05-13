const utils = require('../utils');
const downloader = require('../modules/downloader');

module.exports.register = (program) => {
    program
        .command('update')
        .description('updates neutralinojs binaries, client library, and TypeScript definitions')
        .option('-l, --latest')
        .action(async (command) => {
            utils.checkCurrentProject();
            await downloader.downloadAndUpdateBinaries(command.latest);
            await downloader.downloadAndUpdateClient(command.latest);

            utils.showArt();
            utils.log('Run "neu version" to see installed version details.');
        });
}

