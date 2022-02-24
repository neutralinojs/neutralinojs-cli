const fs = require('fs');
const archiver = require('archiver');
const asar = require('asar');
const config = require('./config');
const constants = require('../constants');
const utils = require('../utils');

async function createAsarFile() {
    utils.log(`Generating ${constants.files.resourceFile}...`);
    const configObj = config.get();
    const resourcesDir = configObj.cli.resourcesPath.replace(/^\//, "");
    const extensionsDir = configObj.cli.extensionsPath?.replace(/^\//, "");
    const clientLibrary = configObj.cli.clientLibrary.replace(/^\//, "");
    const icon = configObj.modes.window.icon.replace(/^\//, "");
    const binaryName = configObj.cli.binaryName;

    fs.mkdirSync(`temp`, { recursive: true });
    fs.copyFileSync(`./${resourcesDir}`, `temp/${resourcesDir}`)

    if(extensionsDir && fs.existsSync(extensionsDir)) {
        fs.copyFileSync(`./${extensionsDir}`, `dist/${binaryName}/${extensionsDir}`)
    }

    fs.copyFileSync(`${constants.files.configFile}`, `temp/${constants.files.configFile}`)
    fs.copyFileSync(`./${clientLibrary}`, `temp/${clientLibrary}`)
    fs.copyFileSync(`./${icon}`, `temp/${icon}`)

    await asar.createPackage('temp', `dist/${binaryName}/${constants.files.resourceFile}`);
}

function clearBuildCache() {
    fs.rmdirSync('temp')
    fs.rmSync('temp', {
        force: true,
        recursive: true
    })
}

module.exports.bundleApp = async (isRelease, copyStorage) => {
    let configObj = config.get();
    let binaryName = configObj.cli.binaryName;
    try {
        await createAsarFile();
        utils.log('Copying binaries...');

        for(let platform in constants.files.binaries) {
            for(let arch in constants.files.binaries[platform]) {
                let originalBinaryFile = constants.files.binaries[platform][arch];
                let destinationBinaryFile = originalBinaryFile.replace('neutralino', binaryName);
                fs.copyFileSync(`bin/${originalBinaryFile}`, `dist/${binaryName}/${destinationBinaryFile}`)
            }
        }

        for(let dependency of constants.files.dependencies) {
            fs.copyFileSync(`bin/${dependency}`,`dist/${binaryName}/${dependency}`);
        }

        if(copyStorage) {
            utils.log('Copying storage data...');
            fs.copyFileSync(`.storage`,`dist/${binaryName}/.storage`);
        }

        if (isRelease) {
            utils.log('Making app bundle ZIP file...');
            let output = fs.createWriteStream(`dist/${binaryName}-release.zip`);
            let archive = archiver('zip', { zlib: { level: 9 } });
            archive.pipe(output);
            archive.directory(`dist/${binaryName}`, false);
            await archive.finalize();
        }
        clearBuildCache();
    }
    catch (e) {
        utils.error(e);
    }
}
