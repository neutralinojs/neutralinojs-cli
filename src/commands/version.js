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
            await utils.checkLatestVersion();
            if(utils.isNeutralinojsProject()) {
                const configObj = config.get();
                console.log(`\n--- Project: ${configObj.cli.binaryName} (${configObj.applicationId}) ---`);
                console.log(`Neutralinojs binaries: ${utils.getVersionTag(configObj.cli.binaryVersion)}`);

                let clientVersion = configObj.cli.clientVersion ? utils.getVersionTag(configObj.cli.clientVersion) :
                                        'Installed from a package manager';
                console.log(`Neutralinojs client: ${clientVersion}`);

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

