const commons = require('../commons');
const downloader = require('../modules/downloader');

module.exports.register = (program) => {
    program
        .command('update')
        .action(async (name, command) => {
            commons.checkCurrentProject();
            await downloader.downloadAndUpdateBinaries();
            await downloader.downloadAndUpdateClient();

            commons.figlet();
            console.log('Run "neu version" to see installed version details.');
        });
}

