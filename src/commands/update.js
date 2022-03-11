const utils = require('../utils');
const getVersion = require('../modules/get-version');
const config = require('../modules/config');
const fs = require('fs');
const semver = require('semver');
const downloader = require('../modules/downloader');


module.exports.register = (program) => {
    program
        .command('update')
        .action(async (name, command) => {
            utils.checkCurrentProject();
            let binaryVersion = await getVersion();
            let clientVersion = await getVersion(true);
            let configFile = config.get()

            if (!binaryVersion || !clientVersion) {
                utils.error("can't fetch the latest neutralinojs version!")
            }

            if (semver.valid(binaryVersion) && semver.gt(binaryVersion, configFile?.cli?.binaryVersion)) {
                utils.log("A Newer NeutralinoJS version is available... Downloading")
                await downloader.downloadAndUpdateBinaries();
                config.update('cli.binaryVersion', binaryVersion)
            }

            if (semver.valid(binaryVersion) && semver.gt(clientVersion, configFile?.cli?.clientVersion)) {
                utils.log("A Newer NeutralinoJS client version is available... Downloading")
                await downloader.downloadAndUpdateClient()
                config.update('cli.clientVersion', clientVersion)
            }

            if (!fs.existsSync('bin') || fs.readdirSync('bin').length == 0) {
                await downloader.downloadAndUpdateBinaries();
            }

            if (!fs.existsSync(configFile?.cli?.clientLibrary)) {
                await downloader.downloadAndUpdateClient();
            }
        });
}
