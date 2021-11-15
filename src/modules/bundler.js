const fse = require('fs-extra');
const fs = require('fs');
const archiver = require('archiver');
const asar = require('asar');
const config = require('./config');
const constants = require('../constants');

const tempName = config.get().cli?.temp ?? 'temp';

async function createAsarFile() {
    console.log(`Generating ${constants.files.resourceFile}...`);
    const configObj = config.get();
    const resourcesDir = configObj.cli.resourcesPath.replace(/^\//, "");
    const clientLibrary = configObj.cli.clientLibrary.replace(/^\//, "");
    const icon = configObj.modes.window.icon.replace(/^\//, "");
    let binaryName = configObj.cli.binaryName;
    fs.mkdirSync(tempName, { recursive: true });
    await fse.copy(`./${resourcesDir}`, `${tempName}/${resourcesDir}`, {overwrite: true});
    await fse.copy(`${constants.files.configFile}`, `${tempName}/${constants.files.configFile}`, {overwrite: true});
    await fse.copy(`./${clientLibrary}`, `${tempName}/${clientLibrary}`, {overwrite: true});
    await fse.copy(`./${icon}`, `${tempName}/${icon}`, {overwrite: true});
    await asar.createPackage(tempName, `dist/${binaryName}/${constants.files.resourceFile}`);
}

function clearBuildCache() {
    fse.removeSync(tempName);
}

module.exports.bundleApp = async (isRelease) => {
    let configObj = config.get();
    let binaryName = configObj.cli.binaryName;
    try {
        await createAsarFile();
        console.log('Copying binaries...');

        for(let platform in constants.files.binaries) {
            for(let arch in constants.files.binaries[platform]) {
                let originalBinaryFile = constants.files.binaries[platform][arch];
                let destinationBinaryFile = originalBinaryFile.replace('neutralino', binaryName);
                fse.copySync(`bin/${originalBinaryFile}`, `dist/${binaryName}/${destinationBinaryFile}`);
            }
        }
        
        fse.copySync(`bin/${constants.files.dependencies.windows_webview2loader_x64}`,
                    `dist/${binaryName}/${constants.files.dependencies.windows_webview2loader_x64}`);
        if (isRelease) {
            let output = fs.createWriteStream(`dist/${binaryName}-release.zip`);
            let archive = archiver('zip', { zlib: { level: 9 } });
            archive.pipe(output);
            archive.directory(`dist/${binaryName}`, false);
            await archive.finalize();
        }
        clearBuildCache();
    }
    catch (e) {
        console.error(e);
    }
}
