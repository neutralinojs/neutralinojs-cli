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
    return constants.remote.binariesUrl
            .replace(/{tag}/g, utils.getVersionTag(version));
}

let getScriptExtension = () => {
    const configObj = config.get();
    let clientLibrary = configObj.cli.clientLibrary;
    return clientLibrary.includes('.mjs') ? 'mjs' : 'js';
}

let getClientDownloadUrl = () => {
    const configObj = config.get();
    let version = configObj.cli.clientVersion;
    let clientLibrary = configObj.cli.clientLibrary;
    let scriptUrl = constants.remote.clientUrlPrefix + getScriptExtension();
    return scriptUrl
            .replace(/{tag}/g, utils.getVersionTag(version));
}

let getRepoNameFromTemplate = (template) => {
    return template.split('/')[1];
}

let downloadBinariesFromRelease = () => {
    return new Promise((resolve, reject) => {
        fs.mkdirSync( { recursive: true });
        const file = fs.createWriteStream('binaries.zip');
        utils.log('Downloading Neutralinojs binaries..');
        https.get(getBinaryDownloadUrl(), function (response) {
            response.pipe(file);
            response.on('end', () => {
                utils.log('Extracting zip file..');
                fs.createReadStream('binaries.zip')
                    .pipe(unzipper.Extract({}))
                    .promise()
                        .then(() => resolve())
                        .catch((e) => reject(e));
            });
        });
    });
}

let downloadClientFromRelease = () => {
    return new Promise((resolve, reject) => {
        fs.mkdirSync('.tmp', { recursive: true });
        const file = fs.createWriteStream('neutralino.' + getScriptExtension());
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
        fs.mkdirSync({ recursive: true });
        const file = fs.createWriteStream('template.zip');
        https.get(templateUrl, function (response) {
            response.pipe(file);
            response.on('end', () => {
                utils.log('Extracting template zip file..');
                fs.createReadStream('template.zip')
                    .pipe(unzipper.Extract({ path: '.tmp/' }))
                    .promise()
                        .then(() => {
                            fse.copySync(`${getRepoNameFromTemplate(template)}-main`, '.');
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
            if(fse.existsSync(`${binaryFile}`)) {
                fse.copySync(`${binaryFile}`, `bin/${binaryFile}`);
            }
        }
    }

    for(let dependency of constants.files.dependencies) {
        fse.copySync(`${dependency}`,`bin/${dependency}`);
    }
    utils.clearCache();
}

module.exports.downloadAndUpdateClient = async () => {
    const configObj = config.get();
    if(!configObj.cli.clientLibrary) {
        utils.log(`neu CLI won't download the client library --` +
                    ` download @neutralinojs/lib from your Node package manager.`);
        return;
    }
    const clientLibrary = utils.trimPath(configObj.cli.clientLibrary);
    await downloadClientFromRelease();
    utils.log('Finalizing and cleaning temp. files...');
    fse.copySync(`${constants.files.clientLibraryPrefix + getScriptExtension()}`
            , `./${clientLibrary}`);
    utils.clearCache();
}

