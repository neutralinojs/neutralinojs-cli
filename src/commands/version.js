const chalk = require('chalk');
const commons = require('../commons');
const constants = require('../constants');
const package = require('../../package.json');
const config = require('../modules/config');

module.exports.register = (program) => {
    program
        .command('version')
        .action(async (command) => {
            commons.figlet();
            console.log('--- Global ---');
            console.log(`Neutralinojs binaries: v${constants.remote.binaries.version}`);
            console.log(`neu CLI: v${package.version}`);
            if(commons.isNeutralinojsProject()) {
                const configObj = config.get();
                console.log(`\n--- Project: ${configObj.cli.binaryName} (${configObj.applicationId}) ---`);
                console.log(`Neutralinojs binaries: v${configObj.cli.binaryVersion}`);
            }
            else {
                console.log(`${chalk.bgGreen.black('INFO')} Run this command inside your project directory` + 
                            ` to get project specific Neutralinojs version.`);
            }
        });
}

