const fs = require('fs');
const fse = require('fs-extra');
const { https } = require('follow-redirects');
const constants = require('../constants');
const unzipper = require('unzipper');
const config = require('./config');
const utils = require('../utils');

let getBinaryDownloadUrl = () => {
    const configObj = config.get();
    let version = configObj.cli.binaryVersion;
    return constants.remote.binaries.url.replace(/{version}/g, version);
}

let getClientDownloadUrl = () => {
    const configObj = config.get();
    let version = configObj.cli.clientVersion;
    return constants.remote.client.url.replace(/{version}/g, version);
}

let getRepoNameFromTemplate = (template) => {
    return template.split('/')[1];
}

let downloadBinariesFromRelease = () => {
    return new Promise((resolve, reject) => {
        fs.mkdirSync('temp', { recursive: true });
        const file = fs.createWriteStream('temp/binaries.zip');
        utils.log('Downloading Neutralinojs binaries..');
        https.get(getBinaryDownloadUrl(), function (response) {
            response.pipe(file);
            response.on('end', () => {
                utils.log('Extracting zip file..');
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
        utils.log('Downloading the Neutralinojs client..');
        https.get(getClientDownloadUrl(), function (response) {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        });
    });
}


module.exports.downloadTemplate = (template) => {
    return new Promise((resolve, reject) => {
        let templateUrl = constants.remote.templateUrl.replace('{template}', template);
        fs.mkdirSync('temp', { recursive: true });
        const file = fs.createWriteStream('temp/template.zip');
        https.get(templateUrl, function (response) {
            response.pipe(file);
            response.on('end', () => {
                utils.log('Extracting template zip file..');
                fs.createReadStream('temp/template.zip')
                    .pipe(unzipper.Extract({ path: 'temp/' }))
                    .promise()
                        .then(() => {
                            fse.copySync(`temp/${getRepoNameFromTemplate(template)}-main`, '.');
                            utils.clearCache();
                            resolve();
                        })
                        .catch((e) => reject(e));
            });
        });
    });
}

module.exports.downloadAndUpdateBinaries = async () => {
    await downloadBinariesFromRelease();
    utils.log('Finalizing and cleaning temp. files.');
    if(!fse.existsSync('bin'))
        fse.mkdirSync('bin');

    for(let platform in constants.files.binaries) {
        for(let arch in constants.files.binaries[platform]) {
            let binaryFile = constants.files.binaries[platform][arch];
            fse.copySync(`temp/${binaryFile}`, `bin/${binaryFile}`);
        }
    }

    for(let dependency of constants.files.dependencies) {
        fse.copySync(`temp/${dependency}`,`bin/${dependency}`);
    }
    utils.clearCache();
}

module.exports.downloadAndUpdateClient = async () => {
    const configObj = config.get();
    const clientLibrary = utils.trimPath(configObj.cli.clientLibrary);
    await downloadClientFromRelease();
    utils.log('Finalizing and cleaning temp. files...');
    fse.copySync(`temp/${constants.files.clientLibrary}`, `./${clientLibrary}`);
    utils.clearCache('temp');
}

