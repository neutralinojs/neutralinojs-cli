const utils = require('../utils');
const package = require('../../package.json');
const config = require('../modules/config');

module.exports.register = (program) => {
    program
        .command('version')
        .description('displays global and project specific versions of packages')
        .action(async (command) => {
            utils.showArt();
            console.log('--- Global ---');
            console.log(`neu CLI: v${package.version}`);
            if(utils.isNeutralinojsProject()) {
                const configObj = config.get();
                console.log(`\n--- Project: ${configObj.cli.binaryName} (${configObj.applicationId}) ---`);
                console.log(`Neutralinojs binaries: v${configObj.cli.binaryVersion}`);
                console.log(`Neutralinojs client: v${configObj.cli.clientVersion}`);
                if(configObj.version) {
                    console.log(`Project version: v${configObj.version}`);
                }
            }
            else {
                utils.log(`Run this command inside your project directory` +
                            ` to get project specific Neutralinojs version.`);
            }
        });
}

