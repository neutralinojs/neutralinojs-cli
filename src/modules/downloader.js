const fs = require('fs');
const fse = require('fs-extra');
const { https } = require('follow-redirects');
const constants = require('../constants');
const unzipper = require('unzipper');
const config = require('./config');

let getUrlWithVersion = (remoteInfo) => {
    let url = remoteInfo.url;
    let version = remoteInfo.version;
    return url.replace(/{version}/g, version);
}

let downloadBinariesFromRelease = () => {
    return new Promise((resolve, reject) => {
        fs.mkdirSync('temp', { recursive: true });
        const file = fs.createWriteStream('temp/binaries.zip');
        console.log('Downloading Neutralinojs binaries..');
        https.get(getUrlWithVersion(constants.remote.binaries), function (response) {
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

let downloadClientFromRelease = () => {
    return new Promise((resolve, reject) => {
        fs.mkdirSync('temp', { recursive: true });
        const file = fs.createWriteStream('temp/neutralino.js');
        console.log('Downloading the Neutralinojs client..');
        https.get(getUrlWithVersion(constants.remote.client), function (response) {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        });
    });
}

let clearDownloadCache = () => {
    //fse.removeSync('temp');
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
    await downloadBinariesFromRelease();
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

module.exports.downloadAndUpdateClient = async () => {
    const configObj = config.get();
    const clientLibrary = configObj.cli.clientLibrary.replace(/^\//, "");
    await downloadClientFromRelease();
    console.log('Finalizing and cleaning temp. files.');
    fse.copySync('temp/neutralino.js', `./${clientLibrary}`);
    clearDownloadCache();
    
    let version = constants.remote.client.version;
    config.update('cli.clientVersion', version);
}

