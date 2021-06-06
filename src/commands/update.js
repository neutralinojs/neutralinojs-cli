const commons = require('../commons');
const downloder = require('../modules/downloader');

module.exports.register = (program) => {
    program
        .command('update')
        .action(async (name, command) => {
            await downloder.downloadAndUpdateBinaries();
            commons.figlet();
        });
}

