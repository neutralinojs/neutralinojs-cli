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
            const projectVersions = isProject ? Promise.all([
                getRemoteLatestVersion('neutralinojs', 5000).catch(() => null),
                getRemoteLatestVersion('neutralino.js', 5000).catch(() => null)
            ]) : null;
            const latest = await utils.checkLatestVersion();
            console.log(`neu CLI: v${package.version} ${latest ? '(latest)' : ''}`);
            if(isProject) {
                const configObj = config.get();
                const [latestBinVersion, latestLibVersion] = await projectVersions;
                if(latestBinVersion === null || latestLibVersion === null) {
                    utils.warn('Unable to check the latest framework versions. Showing installed versions.');
                }
                const clientVersion = configObj.cli.clientVersion ? utils.getVersionTag(configObj.cli.clientVersion) :
                        'Installed from a package manager';
                const latestBin = latestBinVersion === null ? null : configObj.cli.binaryVersion == latestBinVersion;
                const latestLib = configObj.cli.clientVersion && latestLibVersion !== null ? (configObj.cli.clientVersion == latestLibVersion) : null;

                console.log(`\n--- Project: ${configObj.cli.binaryName} (${configObj.applicationId}) ---`);
                console.log(`Neutralinojs binaries: ${utils.getVersionTag(configObj.cli.binaryVersion)} ${latestBin ? '(latest)' : ''}`);
                console.log(`Neutralinojs client: ${clientVersion} ${latestLib ? '(latest)' : ''}`);

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
