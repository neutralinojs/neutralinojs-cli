const fse = require('fs-extra');
const fs = require('fs');
const archiver = require('archiver');
const asar = require('asar');
const config = require('./config');
const constants = require('../constants');

let docRoot = (config.get().docRoot ?? '').replace(/^\//, "").replace(/\/$/, "");
if (docRoot.length > 0) {
    docRoot += "/";
}

async function createAsarFile() {
    console.log(`Generating ${constants.files.resourceFile}...`);
    const configObj = config.get();
    const resourcesDir = configObj.cli.resourcesPath.replace(/^\//, "");
    const clientLibrary = configObj.cli.clientLibrary.replace(/^\//, "");
    const icon = configObj.modes.window.icon.replace(/^\//, "");
    let binaryName = configObj.cli.binaryName;
    fs.mkdirSync(`temp`, { recursive: true });
    await fse.copy(`./${docRoot}${resourcesDir}`, `temp/${resourcesDir}`, {overwrite: true});
    await fse.copy(`${constants.files.configFile}`, `temp/${constants.files.configFile}`, {overwrite: true});
    await fse.copy(`./${docRoot}${clientLibrary}`, `temp/${clientLibrary}`, {overwrite: true});
    await fse.copy(`./${docRoot}${icon}`, `temp/${icon}`, {overwrite: true});
    await asar.createPackage('temp', `dist/${binaryName}/${constants.files.resourceFile}`);
}

function clearBuildCache() {
    fse.removeSync('temp');
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
