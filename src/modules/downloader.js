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
    return new Promise((resolve, _reject) => {
        fs.mkdirSync('.tmp', { recursive: true });
        const file = fs.createWriteStream('.tmp/binaries.zip');
        utils.log('Downloading Neutralinojs binaries..');
        https.get(getBinaryDownloadUrl(), function (response) {
            response.pipe(file);
            response.on('end', () => {
                resolve();
            });
        });
    });
}

let extractBinariesFromRelease = () => {
    return new Promise((resolve, reject) => {
        utils.log('Extracting zip file..');
        fs.createReadStream('.tmp/binaries.zip')
            .pipe(unzipper.Extract({ path: '.tmp/' }))
            .promise()
                .then(() => resolve())
                .catch((e) => reject(e));
    });
}

let downloadClientFromRelease = () => {
    return new Promise((resolve, reject) => {
        fs.mkdirSync('.tmp', { recursive: true });
        const file = fs.createWriteStream('.tmp/neutralino.' + getScriptExtension());
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

let downloadTemplate = (template) => {
    return new Promise((resolve, _reject) => {
        let templateUrl = constants.remote.templateUrl.replace('{template}', template);
        fs.mkdirSync('.tmp', { recursive: true });
        const file = fs.createWriteStream('.tmp/template.zip');
        https.get(templateUrl, function (response) {
            response.pipe(file);
            response.on('end', () => {
                resolve();
                
            });
        });
    });
}

let extractTemplate = (template) => {
    return new Promise((resolve, reject) => {
            utils.log('Extracting template zip file..');
            fs.createReadStream('.tmp/template.zip')
                .pipe(unzipper.Extract({ path: '.tmp/' }))
                .promise()
                    .then(() => {
                        fse.copySync(`.tmp/${getRepoNameFromTemplate(template)}-main`, '.');
                        utils.clearCache();
                        resolve();
                    })
                    .catch((e) => reject(e));
        });
}

module.exports.downloadTemplate = async (template) => {
    await downloadTemplate(template);
    await extractTemplate(template);
}

module.exports.downloadAndUpdateBinaries = async () => {
    await downloadBinariesFromRelease();
    await extractBinariesFromRelease();
    utils.log('Finalizing and cleaning temp. files.');
    if(!fse.existsSync('bin'))
        fse.mkdirSync('bin');

    for(let platform in constants.files.binaries) {
        for(let arch in constants.files.binaries[platform]) {
            let binaryFile = constants.files.binaries[platform][arch];
            if(fse.existsSync(`.tmp/${binaryFile}`)) {
                fse.copySync(`.tmp/${binaryFile}`, `bin/${binaryFile}`);
            }
        }
    }

    for(let dependency of constants.files.dependencies) {
        fse.copySync(`.tmp/${dependency}`,`bin/${dependency}`);
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
    fse.copySync(`.tmp/${constants.files.clientLibraryPrefix + getScriptExtension()}`
            , `./${clientLibrary}`);
    utils.clearCache();
}

