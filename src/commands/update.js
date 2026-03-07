const utils = require('../utils');
const downloader = require('../modules/downloader');

module.exports.register = (program) => {
    program
        .command('update')
        .description('updates neutralinojs binaries, client library, and TypeScript definitions')
        .option('-l, --latest', 'force update to the latest version')
        .option('-b, --binary', 'update only the Neutralinojs binaries')
        .option('-c, --client', 'update only the Neutralinojs client library')
        .action(async (options) => {
            utils.checkCurrentProject();

            const updateAll = !options.binary && !options.client;

            if (options.binary || updateAll) {
                await downloader.downloadAndUpdateBinaries(options.latest);
            }

            if (options.client || updateAll) {
                await downloader.downloadAndUpdateClient(options.latest);
            }

            utils.showArt();
            utils.log('Run "neu version" to see installed version details.');
            utils.log('Next step: Please run "neu build" to package your app with the updated framework.');
        });
}
