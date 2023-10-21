const fs = require('fs');
const recursive = require('recursive-readdir');
const config = require('./config');
const constants = require('../constants');
const utils = require('../utils');

const HOT_REL_LIB_PATCH_REGEX = constants.misc.hotReloadLibPatchRegex;
const HOT_REL_GLOB_PATCH_REGEX = constants.misc.hotReloadGlobPatchRegex;
let originalClientLib = null;
let originalGlobals = null;

async function makeClientLibUrl(port) {
    let configObj = config.get();
    let resourcesPath = configObj.cli.resourcesPath.replace(/^\//, '');
    let files = await recursive(resourcesPath);
    let clientLib = files
        .find((file) => /neutralino\.js$/.test(file))
        ?.replace(/\\/g, '/'); //Fix path on windows;

    let url = `http://localhost:${port}`;

    if (clientLib) {
        clientLib = '/' + clientLib;
        if (configObj.documentRoot) {
            clientLib = clientLib.replace(configObj.documentRoot, '/');
        }
        url += clientLib;
    }
    return url;
}

function makeGlobalsUrl(port) {
    return `http://localhost:${port}/__neutralino_globals.js`;
}

function patchHTMLFile(scriptFile, regex) {
    let configObj = config.get();
    let patchFile = configObj.cli.frontendLibrary.patchFile.replace(/^\//, '');
    let html = fs.readFileSync(patchFile, 'utf8');
    let matches = regex.exec(html);
    if (matches) {
        html = html.replace(regex, `$1${scriptFile}$3`);
        fs.writeFileSync(patchFile, html);
        return matches[2];
    }
    return null;
}

module.exports.bootstrap = async (port) => {
    let configObj = config.get();
    if (configObj.cli.clientLibrary) {
        let clientLibUrl = await makeClientLibUrl(port);
        originalClientLib = patchHTMLFile(
            clientLibUrl,
            HOT_REL_LIB_PATCH_REGEX,
        );
    }
    let globalsUrl = await makeGlobalsUrl(port);
    originalGlobals = patchHTMLFile(globalsUrl, HOT_REL_GLOB_PATCH_REGEX);
    if (originalClientLib || originalGlobals) {
        utils.warn(
            'Neutralinojs patch was applied successfully. ' +
                'Please avoid sending keyboard interrupts.',
        );
        utils.log(
            "You are working with your frontend library's development environment. " +
                'Your app will run in in Neutralino and be able to use the Neutralinojs APIs.',
        );
    } else {
        utils.warn(
            'Failed to apply Neutralinojs patch. Your app may not be able to use the Neutralinojs APIs.',
        );
    }
};

module.exports.cleanup = () => {
    if (originalClientLib) {
        patchHTMLFile(originalClientLib, HOT_REL_LIB_PATCH_REGEX);
    }
    if (originalGlobals) {
        patchHTMLFile(originalGlobals, HOT_REL_GLOB_PATCH_REGEX);
    }
    utils.log('Neutralinojs patch was reverted.');
};
