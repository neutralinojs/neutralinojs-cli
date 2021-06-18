const fs = require('fs');
const fse = require('fs-extra');
const { https } = require('follow-redirects');
const constants = require('../constants');
const unzipper = require('unzipper');
const config = require('./config');

let getBinariesUrl = () => {
    let url = constants.remote.binaries.url;
    let version = constants.remote.binaries.version;
    return url.replace(/{version}/g, version);
}

let downloadFromRelease = () => {
    return new Promise((resolve, reject) => {
        fs.mkdirSync('temp', { recursive: true });
        const file = fs.createWriteStream('temp/binaries.zip');
        console.log('Downloading latest Neutralinojs binaries..');
        https.get(getBinariesUrl(), function (response) {
            response.pipe(file);
            response.on('end', () => {
                console.log('Extracting zip file..');
                fs.createReadStream('temp/binaries.zip')
                    .pipe(unzipper.Extract({ path: 'temp/' }))
                    .promise()
                        .then(() => resolve())
                        .catch((e) => reject(e));
            });
        });
    });
}

let clearDownloadCache = () => {
    fse.removeSync('temp');
}

module.exports.downloadTemplate = (template) => {
    return new Promise((resolve, reject) => {
        let templateUrl = `https://github.com/neutralinojs/${template.repoId}/archive/main.zip`;
        fs.mkdirSync('temp', { recursive: true });
        const file = fs.createWriteStream('temp/template.zip');
        https.get(templateUrl, function (response) {
            response.pipe(file);
            response.on('end', () => {
                console.log('Extracting template zip file..');
                fs.createReadStream('temp/template.zip')
                    .pipe(unzipper.Extract({ path: 'temp/' }))
                    .promise()
                        .then(() => {
                            fse.copySync(`temp/${template.repoId}-main`, '.');
                            clearDownloadCache();
                            resolve();
                        })
                        .catch((e) => reject(e));
            });
        });
    });
}

module.exports.downloadAndUpdateBinaries = async () => {
    await downloadFromRelease();
    console.log('Finalizing and cleaning temp. files.');
    if(!fse.existsSync('bin'))
        fse.mkdirSync('bin');
    fse.copySync('temp/neutralino-win.exe', 'bin/neutralino-win.exe');
    fse.copySync('temp/neutralino-linux', 'bin/neutralino-linux');
    fse.copySync('temp/neutralino-mac', 'bin/neutralino-mac');
    fse.copySync('temp/WebView2Loader.dll', 'bin/WebView2Loader.dll');
    clearDownloadCache();
    
    let version = constants.remote.binaries.version;
    config.update('cli.binaryVersion', version);
}

