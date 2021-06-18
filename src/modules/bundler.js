const fse = require('fs-extra');
const fs = require('fs');
const archiver = require('archiver');
const asar = require('asar');
const config = require('./config');

async function createAsarFile() {
    console.log('Generating res.neu...');
    const configObj = config.get();
    const resourcesDir = configObj.cli.resourcesPath.replace(/^\//, "");
    const clientLibrary = configObj.cli.clientLibrary.replace(/^\//, "");
    const icon = configObj.modes.window.icon.replace(/^\//, "");
    let binaryName = configObj.cli.binaryName;
    fs.mkdirSync(`temp`, { recursive: true });
    await fse.copy(`./${resourcesDir}`, `temp/${resourcesDir}`, {overwrite: true});
    await fse.copy(`neutralino.config.json`, 'temp/neutralino.config.json', {overwrite: true});
    await fse.copy(`./${clientLibrary}`, `temp/${clientLibrary}`, {overwrite: true});
    await fse.copy(`./${icon}`, `temp/${icon}`, {overwrite: true});
    await asar.createPackage('temp', `dist/${binaryName}/res.neu`);
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
        fse.copySync(`bin/neutralino-win.exe`, `dist/${binaryName}/${binaryName}-win.exe`);
        fse.copySync(`bin/neutralino-linux`, `dist/${binaryName}/${binaryName}-linux`);
        fse.copySync(`bin/neutralino-mac`, `dist/${binaryName}/${binaryName}-mac`);
        fse.copySync(`bin/WebView2Loader.dll`, `dist/${binaryName}/WebView2Loader.dll`);
        if (isRelease) {
            // TODO: Add installers in the future
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
