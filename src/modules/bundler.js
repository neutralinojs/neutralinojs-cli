const fse = require('fs-extra');
const fs = require('fs');
const archiver = require('archiver');
const { spawn } = require('child_process');
const asar = require('asar');

module.exports.bundleApp = async (settings) => {
    try {
        await asar.createPackage('app', `dist/${settings.appname}-release/res.neu`);
        fse.copySync(`${settings.appname}-win.exe`, `dist/${settings.appname}-release/${settings.appname}-win.exe`);
        fse.copySync(`${settings.appname}-linux`, `dist/${settings.appname}-release/${settings.appname}-linux`);
        fse.copySync(`${settings.appname}-mac`, `dist/${settings.appname}-release/${settings.appname}-mac`);
        let output = fs.createWriteStream(`dist/${settings.appname}-release.zip`);
        let archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(output);
        archive.directory(`dist/${settings.appname}-release`, false);
        await archive.finalize();
    }
    catch (e) {
        console.error(e);
    }
}

module.exports.buildApp = (buildSuccessCallback = null, verbose = false) => {
    const proc = spawn('npm run build', {
        shell: true,
        stdio: ['inherit', verbose ? 'inherit' : 'ignore', 'inherit'],
    });
    proc.on('exit', function (code) {
        if (code == 0 && buildSuccessCallback) buildSuccessCallback();
    });
}
