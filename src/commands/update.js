const utils = require('../utils');
const downloader = require('../modules/downloader');

module.exports.register = (program) => {
    program
        .command('update')
        .description('updates neutralinojs binaries, client library, and TypeScript definitions')
        .option('-l, --latest', 'fetches the latest version details and updates the app configuration')
        .option('-b, --binary', 'updates only the neutralinojs binaries')
        .option('-c, --client', 'updates only the neutralinojs client library') 
        .action(async (command) => {
            utils.checkCurrentProject();
            const updateAll = !command.binary && !command.client;

            if (updateAll || command.binary) {
            await downloader.downloadAndUpdateBinaries(command.latest);
            }
            if (updateAll || command.client) {
            await downloader.downloadAndUpdateClient(command.latest);
            }
            utils.showArt();
            utils.log('Run "neu version" to see installed version details.');
        });
}

