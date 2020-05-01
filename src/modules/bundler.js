const fse = require('fs-extra');
const fs = require('fs');
const archiver = require('archiver');
const commons = require('../commons');

module.exports.bundleApp = (settings) => {
    try {
        fse.copySync('app', `dist/${settings.appname}-release/app`);
        fse.copySync('storage', `dist/${settings.appname}-release/storage`);
        fse.copySync(`${settings.appname}-win.exe`, `dist/${settings.appname}-release/${settings.appname}-win.exe`);
        fse.copySync(`${settings.appname}-linux`, `dist/${settings.appname}-release/${settings.appname}-linux`);
        fse.copySync(`${settings.appname}-mac`, `dist/${settings.appname}-release/${settings.appname}-mac`);

        let output = fs.createWriteStream(`dist/${settings.appname}-release.zip`);
        let archive = archiver('zip', {zlib: { level: 9 }});
        archive.pipe(output);
        archive.directory(`dist/${settings.appname}-release`, false);
        archive.finalize();
        commons.figlet(() => {
            console.log(`${settings.appname} was release to dist`);
        });
    }
    catch (e) {
        console.error(e);
    }
}