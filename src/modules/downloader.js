const fs = require('fs');
const fse = require('fs-extra');
const { https } = require('follow-redirects');
const constants = require('../constants');
const config = require('./config');
const utils = require('../utils');
const decompress = require('decompress');

let cachedLatestClientVersion = null;

let getLatestVersion = (repo) => {
    return new Promise((resolve, reject) => {
        function fallback() {
            utils.warn('Unable to fetch the latest version tag from GitHub. Using nightly releases...');
            resolve('nightly');
        }

        let opt = {
            headers: { 'User-Agent': 'Neutralinojs CLI' }
        };
        https.get(constants.remote.releasesApiUrl.replace('{repo}', repo), opt, function (response) {
            let body = '';
            response.on('data', (data) => body += data);
            response.on('end', () => {
                if (response.statusCode != 200) {
                    return fallback();
                }
                let apiRes = JSON.parse(body);
                let version = apiRes.tag_name.replace('v', '');
                utils.log(`Found the latest release tag ${utils.getVersionTag(version)} for ${repo}...`);
                resolve(version);
            });
            response.on('error', () => {
                fallback();
            });
        });
    });
}

let getScriptExtension = () => {
    const configObj = config.get();
    let clientLibrary = configObj.cli.clientLibrary;
    return clientLibrary.includes('.mjs') ? 'mjs' : 'js';
}

let getBinaryDownloadUrl = async (latest) => {
    const configObj = config.get();
    let version = configObj.cli.binaryVersion;

    if (!version || latest) {
        version = await getLatestVersion('neutralinojs');
        config.update('cli.binaryVersion', version);
    }
    return constants.remote.binariesUrl
        .replace(/{tag}/g, utils.getVersionTag(version));
}

let getClientDownloadUrl = async (latest, types = false) => {
    const configObj = config.get();
    let version = configObj.cli.clientVersion;

    if (!version || latest) {
        if (cachedLatestClientVersion) {
            version = cachedLatestClientVersion;
        }
        else {
            version = await getLatestVersion('neutralino.js');
        }
        cachedLatestClientVersion = version;
        config.update('cli.clientVersion', version);
    }

    let scriptUrl = constants.remote.clientUrlPrefix + (types ? 'd.ts' : getScriptExtension());
    return scriptUrl
        .replace(/{tag}/g, utils.getVersionTag(version));
}

let getTypesDownloadUrl = (latest) => {
    return getClientDownloadUrl(latest, true);
}

let getRepoNameFromTemplate = (template) => {
    return template.split('/')[1];
}

let downloadBinariesFromRelease = (latest) => {
    return new Promise((resolve, reject) => {
        fs.mkdirSync('.tmp', { recursive: true });
        const zipFilename = '.tmp/binaries.zip';
        const file = fs.createWriteStream(zipFilename);
        utils.log('Downloading Neutralinojs binaries..');
        getBinaryDownloadUrl(latest)
            .then((url) => {
                https.get(url, function (response) {
                    response.pipe(file);
                    response.on('end', () => {
                        utils.log('Extracting binaries.zip file...');
                        decompress(zipFilename, '.tmp/')
                            .then(() => resolve())
                            .catch((e) => reject(e));
                    });
                });
            });
    });
}

let downloadClientFromRelease = (latest) => {
    return new Promise((resolve, reject) => {
        fs.mkdirSync('.tmp', { recursive: true });
        const file = fs.createWriteStream('.tmp/neutralino.' + getScriptExtension());
        utils.log('Downloading the Neutralinojs client..');
        getClientDownloadUrl(latest)
            .then((url) => {
                https.get(url, function (response) {
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve();
                    });
                });
            });
    });
}

let downloadTypesFromRelease = (latest) => {
    return new Promise((resolve, reject) => {
        fs.mkdirSync('.tmp', { recursive: true });
        const file = fs.createWriteStream('.tmp/neutralino.d.ts');
        utils.log('Downloading the Neutralinojs types..');

        getTypesDownloadUrl(latest)
            .then((url) => {
                https.get(url, function (response) {
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve();
                    });
                });
            });
    });
}

module.exports.downloadTemplate = (template) => {
    return new Promise((resolve, reject) => {
        let templateUrl = constants.remote.templateUrl.replace('{template}', template);
        fs.mkdirSync('.tmp', { recursive: true });
        const zipFilename = '.tmp/template.zip';
        const file = fs.createWriteStream(zipFilename);
        https.get(templateUrl, function (response) {
            response.pipe(file);
            response.on('end', () => {
                utils.log('Extracting template zip file...');
                decompress(zipFilename, '.tmp/')
                    .then(() => {
                        fse.copySync(`.tmp/${getRepoNameFromTemplate(template)}-main`, '.');
                        utils.clearDirectory('.tmp');
                        resolve();
                    })
                    .catch((e) => reject(e));
            });
        });
    });
}

module.exports.downloadAndUpdateBinaries = async (latest = false) => {
    await downloadBinariesFromRelease(latest);
    utils.log('Finalizing and cleaning temp. files.');
    if (!fse.existsSync('bin'))
        fse.mkdirSync('bin');

    for (let platform in constants.files.binaries) {
        for (let arch in constants.files.binaries[platform]) {
            let binaryFile = constants.files.binaries[platform][arch];
            if (fse.existsSync(`.tmp/${binaryFile}`)) {
                fse.copySync(`.tmp/${binaryFile}`, `bin/${binaryFile}`);
            }
        }
    }

    for (let dependency of constants.files.dependencies) {
        fse.copySync(`.tmp/${dependency}`, `bin/${dependency}`);
    }
    utils.clearDirectory('.tmp');
}

module.exports.downloadAndUpdateClient = async (latest = false) => {
    const configObj = config.get();
    if (!configObj.cli.clientLibrary) {
        utils.log(`neu CLI won't download the client library --` +
            ` download @neutralinojs/lib from your Node package manager.`);
        return;
    }
    const clientLibrary = utils.trimPath(configObj.cli.clientLibrary);
    await downloadClientFromRelease(latest);
    await downloadTypesFromRelease(latest);
    utils.log('Finalizing and cleaning temp. files...');
    fse.copySync(`.tmp/${constants.files.clientLibraryPrefix + getScriptExtension()}`
        , `./${clientLibrary}`);
    fse.copySync(`.tmp/neutralino.d.ts`
        , `./${clientLibrary.replace(/[.][a-z]*$/, '.d.ts')}`);
    utils.clearDirectory('.tmp');
}

module.exports.checkIfTemplateValid = (template) => {
    return new Promise((resolve) => {
        https.get(constants.remote.templateCheckUrl.replace('{template}', template), {
            headers: {
                'User-Agent': 'Neutralinojs CLI'
            }
        }, function (response) {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    if(jsonData.message === 'Not Found') {
                        resolve(false);
                    }
                    else if(jsonData.message && jsonData.message.includes("API rate limit exceeded")) {
                        utils.warn('Unable to check the template validity due to API rate limits.');
                        resolve(true);
                    }
                    else{
                        resolve(true);
                    }
                } catch (error) {
                    utils.warn('Unable to check the template validity.');
                    resolve(true);
                }
            });
            
            response.on('error', () => {
                utils.warn('Unable to check the template validity.');
                resolve(true);
            });
        });
    });
    
}
