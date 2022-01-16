const fs = require('fs');
const recursive = require('recursive-readdir');
const chalk = require('chalk');
const config = require('./config');
const constants = require('../constants');

const HOT_REL_PATCH_REGEX = constants.misc.hotReloadPatchRegex;
let originalClientLib = null;

async function makeClientLibUrl(port) {
    let configObj = config.get();
    let resourcesPath = configObj.cli.resourcesPath.replace(/^\//, '');
    let files = await recursive(resourcesPath);
    let clientLib = files.find((file) => /neutralino\.js$/.test(file));

    let url = `http://localhost:${port}`;

    if(clientLib) {
        clientLib = '/' + clientLib;
        if(configObj.documentRoot) {
            clientLib = clientLib.replace(configObj.documentRoot, '/');
        }
        url += clientLib;
    }
    return url;
}

function patchHTMLFile(clientLib) {
    let configObj = config.get();
    let patchFile = configObj.cli.frontendLibrary.patchFile.replace(/^\//, '');
    let html = fs.readFileSync(patchFile, 'utf8');
    let matches = HOT_REL_PATCH_REGEX.exec(html);
    if(matches) {
        html = html.replace(HOT_REL_PATCH_REGEX, `$1${clientLib}$3`);
        fs.writeFileSync(patchFile, html);
        return matches[2];
    }
    return null;
}

module.exports.bootstrap = async (port) => {
    let clientLibUrl = await makeClientLibUrl(port);
    originalClientLib = patchHTMLFile(clientLibUrl);
    console.log(`${chalk.bgYellow.white('WARNING')} Hot reload patch was applied successfully. ` +
        `Please avoid sending keyboard interrupts.`);
    console.log('You working with your frontend library\'s development environment. ' +
        'Hot reload and other tooling will work alongside with Neutralinojs API.');
}

module.exports.cleanup = () => {
    if(originalClientLib) {
        patchHTMLFile(originalClientLib);
        console.log('Hot reload patch was reverted.');
    }
}
