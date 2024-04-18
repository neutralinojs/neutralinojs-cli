const utils = require('../utils');
const downloader = require('../modules/downloader');

module.exports.register = (program) => {
    program
        .command('update')
        .description('updates neutralinojs binaries, client library, and TypeScript definitions')
        .option('-l, --latest')
        .action(async (command) => {
            utils.checkCurrentProject();
            utils.spinner.start("Updating Neutralinojs binaries, Client library and Type definitions...");
            await downloader.downloadAndUpdateBinaries(command.latest);
            await downloader.downloadAndUpdateClient(command.latest);

            utils.showArt();
            utils.spinner.succeed('Run "neu version" to see installed version details.');
        });
}

