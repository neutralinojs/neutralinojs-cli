const fse = require('fs-extra');
const fs = require('fs');
const archiver = require('archiver');
const asar = require('asar');
const settings = require('./settings');

async function createAsarFile() {
    const settingsObj = settings.get();
    const resourcesDir = settingsObj.cli.resourcesPath.replace(/^\//, "");
    const clientLibrary = settingsObj.cli.clientLibrary.replace(/^\//, "");
    const icon = settingsObj.modes.window.icon.replace(/^\//, "");
    let binaryName = settingsObj.cli.binaryName;
    fs.mkdirSync(`temp`, { recursive: true });
    await fse.copy(`./${resourcesDir}`, `temp/${resourcesDir}`, {overwrite: true});
    await fse.copy(`neutralino.config.json`, 'temp/neutralino.config.json', {overwrite: true});
    await fse.copy(`./${clientLibrary}`, `temp/${clientLibrary}`, {overwrite: true});
    await fse.copy(`./${icon}`, `temp/${icon}`, {overwrite: true});
    await asar.createPackage('temp', `dist/${binaryName}/res.neu`);
}

function clearBuildCache() {
    fse.removeSync(`temp`);
}

module.exports.bundleApp = async (isRelease, buildSuccessCallback = null) => {
    let settingsObj = settings.get();
    let binaryName = settingsObj.cli.binaryName;
    try {
        await createAsarFile();
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
        if(buildSuccessCallback)
            buildSuccessCallback();
    }
    catch (e) {
        console.error(e);
    }
}
