const utils = require('../utils');
const package = require('../../package.json');
const config = require('../modules/config');
const { getRemoteLatestVersion } = require('../modules/downloader');

module.exports.register = (program) => {
    program
        .command('version')
        .description('displays global and project specific versions of packages')
        .action(async (command) => {
            utils.showArt();
            console.log('--- Global ---');
            const latest = await utils.checkLatestVersion();
            console.log(`neu CLI: v${package.version} ${latest ? '(latest)' : ''}`);
            if(utils.isNeutralinojsProject()) {
                const configObj = config.get();
                let latestBinVersion = null;
                let latestLibVersion = null;
                try {
                    latestBinVersion = await getRemoteLatestVersion('neutralinojs');
                    latestLibVersion = await getRemoteLatestVersion('neutralino.js');
                }
                catch(e) {
                    utils.warn('Unable to fetch latest framework versions. Check your internet connection.');
                }
                const clientVersion = configObj.cli.clientVersion ? utils.getVersionTag(configObj.cli.clientVersion) :
                        'Installed from a package manager';
                const latestBin = latestBinVersion ? (configObj.cli.binaryVersion == latestBinVersion) : null;
                const latestLib = (latestLibVersion && configObj.cli.clientVersion) ? (configObj.cli.clientVersion == latestLibVersion) : null;
                console.log(`\n--- Project: ${configObj.cli.binaryName} (${configObj.applicationId}) ---`);
                console.log(`Neutralinojs binaries: ${utils.getVersionTag(configObj.cli.binaryVersion)} ${latestBin === true ? '(latest)' : latestBin === false ? '' : '(offline)'}`);
                console.log(`Neutralinojs client: ${clientVersion} ${latestLib === true ? '(latest)' : latestLib === false ? '' : ''}`);

                if(!latestBin || latestLib === false) {
                    utils.warn(`This project doesn't use the latest Neutralinojs framework. Run ` +
                        `'neu update --latest' to download the latest framework binaries and the client library.`);
                }

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

