const fs = require('fs');
const fse = require('fs-extra');
const { https } = require('follow-redirects');
const constants = require('../constants');
const unzipper = require('unzipper');
const settings = require('../modules/settings');

let downloadBinaries = (callback, name = null) => {
    let pathPrefix = name ? `${name}/` : '';
    fs.mkdirSync(`${pathPrefix}temp`, { recursive: true });
    const file = fs.createWriteStream(`${pathPrefix}temp/binaries.zip`);
    console.log('Downloading latest Neutralino binaries..');
    https.get(constants.binaries.url, function (response) {
        response.pipe(file);
        response.on('end', () => {
            console.log('Extracting zip file..');
            fs.createReadStream(`${pathPrefix}temp/binaries.zip`)
                .pipe(unzipper.Extract({ path: `${pathPrefix}temp/` }))
                .promise().then(() => { callback(name) });
        });
    });
}

let clearDownloadCache = (pathPrefix) => {
    fse.removeSync(`${pathPrefix}temp`);
}

module.exports.downloadAndUpdateBinaries = (callback, name) => {
    let pathPrefix = name ? `${name}/` : '';
    let appNameFromSettings = false;
    if(!name) {
        appNameFromSettings = true;
        name = settings.get().appname;
    }
        
    downloadBinaries(() => {
        console.log('Finalizing and cleaning temp. files.');
        fse.copySync(`${pathPrefix}temp/neutralino-win.exe`, `${pathPrefix}${name}-win.exe`);
        fse.copySync(`${pathPrefix}temp/neutralino-linux`, `${pathPrefix}${name}-linux`);
        fse.copySync(`${pathPrefix}temp/neutralino-mac`, `${pathPrefix}${name}-mac`);
        clearDownloadCache(pathPrefix);
        if(callback)
            callback();
    }, appNameFromSettings ? null : name);
}

