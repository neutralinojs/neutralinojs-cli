const fse = require('fs-extra');
const fs = require('fs');
const archiver = require('archiver');
const { spawn } = require('child_process');

module.exports.bundleApp = (settings) => {
    try {
        fse.copySync('app', `dist/${settings.appname}-release/app`);
        fse.copySync('storage', `dist/${settings.appname}-release/storage`);
        fse.copySync(`${settings.appname}-win.exe`, `dist/${settings.appname}-release/${settings.appname}-win.exe`);
        fse.copySync(`${settings.appname}-linux`, `dist/${settings.appname}-release/${settings.appname}-linux`);
        fse.copySync(`${settings.appname}-mac`, `dist/${settings.appname}-release/${settings.appname}-mac`);
        if(settings.window && settings.window.iconfile)
            fse.copySync(`${settings.window.iconfile}`, `dist/${settings.appname}-release/${settings.window.iconfile}`);

        let output = fs.createWriteStream(`dist/${settings.appname}-release.zip`);
        let archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(output);
        archive.directory(`dist/${settings.appname}-release`, false);
        archive.finalize();
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