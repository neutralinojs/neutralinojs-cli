const commons = require('../commons');
const constants = require('../constants');
const package = require('../../package.json');

module.exports.register = (program) => {
    program
        .command('version')
        .action(async (command) => {
            commons.figlet();
            console.log(`Neutralinojs binaries: v${constants.remote.binaries.version}`);
            console.log(`neu CLI: v${package.version}`);
        });
}

