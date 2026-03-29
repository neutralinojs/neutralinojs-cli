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
            
            const isProject = utils.isNeutralinojsProject();
            let configObj = null;

            const globalCheckPromise = utils.checkLatestVersion();
            let binCheckPromise = Promise.resolve(null);
            let libCheckPromise = Promise.resolve(null);

            if(isProject) {
                configObj = config.get();
                binCheckPromise = getRemoteLatestVersion('neutralinojs').catch(() => null);
                libCheckPromise = getRemoteLatestVersion('neutralino.js').catch(() => null);
            }

            const [latest, latestBinVersion, latestLibVersion] = await Promise.all([
                globalCheckPromise, 
                binCheckPromise, 
                libCheckPromise
            ]);

            console.log(`neu CLI: v${package.version} ${latest === true ? '(latest)' : ''}`);
            
            if(isProject) {
                const clientVersion = configObj.cli.clientVersion ? utils.getVersionTag(configObj.cli.clientVersion) :
                        'Installed from a package manager';
                const latestBin = latestBinVersion ? (configObj.cli.binaryVersion == latestBinVersion) : null;
                const latestLib = (configObj.cli.clientVersion && latestLibVersion) ? (configObj.cli.clientVersion == latestLibVersion) : null;

                console.log(`\n--- Project: ${configObj.cli.binaryName} (${configObj.applicationId}) ---`);
                console.log(`Neutralinojs binaries: ${utils.getVersionTag(configObj.cli.binaryVersion)} ${latestBin === true ? '(latest)' : ''}`);
                console.log(`Neutralinojs client: ${clientVersion} ${latestLib === true ? '(latest)' : ''}`);

                if(latestBin === false || latestLib === false) {
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

