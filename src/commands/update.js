const utils = require('../utils');
const downloader = require('../modules/downloader');

module.exports.register = (program) => {
    program
        .command('update')
        .description('updates neutralinojs binaries, client library, and TypeScript definitions')
        .option('-l, --latest')
        .option('-p, --proxy [proxy]', 'specify proxy URL for downloading resources')
        .action(async (command) => {
            utils.checkCurrentProject();
            await downloader.downloadAndUpdateBinaries(command.latest, command.proxy);
            await downloader.downloadAndUpdateClient(command.latest, command.proxy);

            utils.showArt();
            utils.log('Run "neu version" to see installed version details.');
        });
}
