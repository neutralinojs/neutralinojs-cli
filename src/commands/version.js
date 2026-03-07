const utils = require('../utils');
const package = require('../../package.json');
const config = require('../modules/config');
const { getRemoteLatestVersion } = require('../modules/downloader');

module.exports.register = (program) => {
    program
        .command('version')
        .description('displays global and project specific versions of packages')
        .option('--json', 'output in JSON format')
        .option('--health', 'check environment health and project readiness')
        .action(async (options) => {
            const latest = await utils.checkLatestVersion();
            let versionData = {
                global: {
                    neuCli: `v${package.version}`,
                    isLatest: latest
                }
            };

            if (utils.isNeutralinojsProject()) {
                const configObj = config.get();
                const latestBinVersion = await getRemoteLatestVersion('neutralinojs');
                const latestLibVersion = await getRemoteLatestVersion('neutralino.js');

                const clientVersion = configObj.cli.clientVersion ? utils.getVersionTag(configObj.cli.clientVersion) :
                                        'Installed from a package manager';
                const latestBin = configObj.cli.binaryVersion == latestBinVersion;
                const latestLib = configObj.cli.clientVersion ? (configObj.cli.clientVersion == latestLibVersion) : null;

                versionData.project = {
                    binaryName: configObj.cli.binaryName,
                    applicationId: configObj.applicationId,
                    binaryVersion: utils.getVersionTag(configObj.cli.binaryVersion),
                    clientVersion: clientVersion,
                    isBinaryLatest: latestBin,
                    isClientLatest: latestLib,
                    projectVersion: configObj.version || null
                };
            }

            if (options.json) {
                console.log(JSON.stringify(versionData, null, 2));
                return;
            }

            utils.showArt();
            console.log('--- Global ---');
            console.log(`neu CLI: v${package.version} ${latest ? '(latest)' : ''}`);

            if (versionData.project) {
                const p = versionData.project;
                console.log(`\n--- Project: ${p.binaryName} (${p.applicationId}) ---`);
                console.log(`Neutralinojs binaries: ${p.binaryVersion} ${p.isBinaryLatest ? '(latest)' : ''}`);
                console.log(`Neutralinojs client: ${p.clientVersion} ${p.isClientLatest ? '(latest)' : ''}`);

                if (!p.isBinaryLatest || p.isClientLatest === false) {
                    utils.warn(`This project doesn't use the latest Neutralinojs framework. Run ` +
                        `'neu update --latest' to download the latest framework binaries and the client library.`);
                }

                if (p.projectVersion) {
                    console.log(`Project version: v${p.projectVersion}`);
                }
            } else {
                utils.log(`Run this command inside your project directory to get project specific Neutralinojs version.`);
            }

            if (options.health) {
                console.log(`\n--- Health Check ---`);
                const isProject = !!versionData.project;
                console.log(`Neutralino Project: ${isProject ? '✅ Yes' : '❌ No'}`);
                if (isProject) {
                    console.log(`Version Drift: ${(!versionData.project.isBinaryLatest) ? '⚠️ Outdated' : '✅ Up to date'}`);
                }
            }
        });
}
