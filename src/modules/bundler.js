const fse = require('fs-extra');
const fs = require('fs');
const archiver = require('archiver');
const asar = require('asar');
const config = require('./config');
const constants = require('../constants');
const utils = require('../utils');

async function createAsarFile() {
    utils.log(`Generating ${constants.files.resourceFile}...`);
    const configObj = config.get();
    const resourcesDir = utils.trimPath(configObj.cli.resourcesPath);
    const extensionsDir = utils.trimPath(configObj.cli.extensionsPath);
    const clientLibrary = utils.trimPath(configObj.cli.clientLibrary);
    const distributionPath = utils.trimPath(configObj.distributionPath);

    const icon = utils.trimPath(configObj.modes.window.icon);
    const binaryName = configObj.cli.binaryName;

    fs.mkdirSync(`.tmp`, { recursive: true });
    await fse.copy(`./${resourcesDir}`, `.tmp/${resourcesDir}`, {overwrite: true});

    if(extensionsDir && fs.existsSync(extensionsDir)) {
        await fse.copy(`./${extensionsDir}`, `${distributionPath}/${binaryName}/${extensionsDir}`, {overwrite: true});
    }

    await fse.copy(`${constants.files.configFile}`, `.tmp/${constants.files.configFile}`, {overwrite: true});
    await fse.copy(`./${clientLibrary}`, `.tmp/${clientLibrary}`, {overwrite: true});
    await fse.copy(`./${icon}`, `.tmp/${icon}`, {overwrite: true});

    await asar.createPackage('.tmp', `${distributionPath}/${binaryName}/${constants.files.resourceFile}`);
}

module.exports.bundleApp = async (isRelease, copyStorage) => {
    let configObj = config.get();
    let binaryName = configObj.cli.binaryName;
    let distributionPath = utils.trimPath(configObj.distributionPath);
    try {
        await createAsarFile();
        utils.log('Copying binaries...');

        for(let platform in constants.files.binaries) {
            for(let arch in constants.files.binaries[platform]) {
                let originalBinaryFile = constants.files.binaries[platform][arch];
                let destinationBinaryFile = originalBinaryFile.replace('neutralino', binaryName);
                if(fse.existsSync(`bin/${originalBinaryFile}`)) {
                    fse.copySync(`bin/${originalBinaryFile}`, `${distributionPath}/${binaryName}/${destinationBinaryFile}`);
                }
            }
        }

        for(let dependency of constants.files.dependencies) {
            fse.copySync(`bin/${dependency}`,`${distributionPath}/${binaryName}/${dependency}`);
        }

        if(copyStorage) {
            utils.log('Copying storage data...');
            try {
                fse.copySync('.storage',`${distributionPath}/${binaryName}/.storage`);
            }
            catch(err) {
                utils.error('Unable to copy storage data from the .storage directory. Please check if the directory exists');
                process.exit(1);
            }
        }

        if (isRelease) {
            utils.log('Making app bundle ZIP file...');
            let output = fs.createWriteStream(`${distributionPath}/${binaryName}-release.zip`);
            let archive = archiver('zip', { zlib: { level: 9 } });
            archive.pipe(output);
            archive.directory(`${distributionPath}/${binaryName}`, false);
            await archive.finalize();
        }
        utils.clearCache();
    }
    catch (e) {
        utils.error(e);
    }
}
