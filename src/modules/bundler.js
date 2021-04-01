const fse = require('fs-extra');
const fs = require('fs');
const archiver = require('archiver');
const { spawn } = require('child_process');
const asar = require('asar');
const settings = require('./settings');

async function createAsarFile() {
    let settingsObj = settings.get();
    fs.mkdirSync(`temp`, { recursive: true });
    await fse.copy(`resources/`, 'temp/resources/', {overwrite: true});
    await fse.copy(`neutralino.config.json`, 'temp/neutralino.config.json', {overwrite: true});
    await asar.createPackage('temp', `dist/${settingsObj.binaryName}/res.neu`);
}

function clearBuildCache() {
    fse.removeSync(`temp`);
}

module.exports.bundleApp = async (isRelease, buildSuccessCallback = null) => {
    let settingsObj = settings.get();
    try {
        await createAsarFile();
        fse.copySync(`${settingsObj.binaryName}-win.exe`, `dist/${settingsObj.binaryName}/${settingsObj.binaryName}-win.exe`);
        fse.copySync(`${settingsObj.binaryName}-linux`, `dist/${settingsObj.binaryName}/${settingsObj.binaryName}-linux`);
        fse.copySync(`${settingsObj.binaryName}-mac`, `dist/${settingsObj.binaryName}/${settingsObj.binaryName}-mac`);
        if (isRelease) {
            // TODO: Add installers in the future
            let output = fs.createWriteStream(`dist/${settingsObj.binaryName}-release.zip`);
            let archive = archiver('zip', { zlib: { level: 9 } });
            archive.pipe(output);
            archive.directory(`dist/${settingsObj.binaryName}`, false);
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
