const commons = require('../commons');
const downloder = require('../modules/downloader');

module.exports.register = (program) => {
    program
        .command('update')
        .action((name, command) => {
            downloder.downloadAndUpdateBinaries(() => {
                commons.figlet();
            });
        });
}

