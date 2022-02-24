const fs = require('fs');
const fse = require('fs-extra'); // soon fs-extra will be completely removed as a dependency.
const constants = require('../constants');
const unzipper = require('unzipper');
const config = require('./config');
const utils = require('../utils');
const fetch = require('node-fetch');

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

        fetch(getBinaryDownloadUrl()).then(res => {
            res.body.pipe(file);
        })

        file.on('finish', () => {
            utils.log('Extracting zip file..');
            fs.createReadStream('temp/binaries.zip')
                .pipe(unzipper.Extract({ path: 'temp/' }))
                .promise()
                    .then(() => resolve())
                    .catch(err => reject(err));
        })
    });
}

let downloadClientFromRelease = () => {
    return new Promise((resolve, reject) => {
        fs.mkdirSync('temp', { recursive: true });
        const file = fs.createWriteStream('temp/neutralino.js');
        utils.log('Downloading the Neutralinojs client..');

        fetch(getClientDownloadUrl()).then(res => {
            res.body.pipe(file);
        }).catch(err => reject(err))

        file.on('finish', () => {
            file.close();
            resolve();
        })
    });
}

let clearDownloadCache = () => {
    fs.rmSync('temp', {
        force: true,
        recursive: true
    })
}

module.exports.downloadTemplate = (template) => {
    return new Promise((resolve, reject) => {
        let templateUrl = constants.remote.templateUrl.replace('{template}', template);
        fs.mkdirSync('temp');
        const file = fs.createWriteStream('temp/template.zip');

        fetch(templateUrl).then(res => {
            res.body.pipe(file);
        })

        file.on('finish', () => {
            utils.log('Extracting template zip file..');
            fs.createReadStream('temp/template.zip')
                .pipe(unzipper.Extract({ path: 'temp/' }))
                .promise()
                    .then(() => {
                        fse.copySync(`temp/${getRepoNameFromTemplate(template)}-main`, '.');
                        clearDownloadCache();
                        resolve();
                    })
                    .catch((e) => reject(e));
        })
    });
}

module.exports.downloadAndUpdateBinaries = async () => {
    await downloadBinariesFromRelease();
    utils.log('Finalizing and cleaning temp. files.');
    if (!fs.existsSync('bin'))
        fs.mkdirSync('bin');

    for (let platform in constants.files.binaries) {
        for (let arch in constants.files.binaries[platform]) {
            let binaryFile = constants.files.binaries[platform][arch];
            fs.copyFileSync(`temp/${binaryFile}`, `bin/${binaryFile}`);
        }
    }

    for (let dependency of constants.files.dependencies) {
        fs.copyFileSync(`temp/${dependency}`,`bin/${dependency}`);
    }
    clearDownloadCache();
}

module.exports.downloadAndUpdateClient = async () => {
    const configObj = config.get();
    const clientLibrary = configObj.cli.clientLibrary.replace(/^\//, "");
    await downloadClientFromRelease();
    utils.log('Finalizing and cleaning temp. files...');
    fs.copyFileSync(`temp/${constants.files.clientLibrary}`, `./${clientLibrary}`);
    clearDownloadCache()
}

