const fs = require('fs');
const process = require('process');
const spawnCommand = require('spawn-command');
const recursive = require('recursive-readdir');
const tpu = require('tcp-port-used');
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

    if(clientLib) {
        clientLib = '/' + clientLib;
        if(configObj.documentRoot) {
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
    if(matches) {
        html = html.replace(regex, `$1${scriptFile}$3`);
        fs.writeFileSync(patchFile, html);
        return matches[2];
    }
    return null;
}

function getPortByProtocol(protocol) {
    switch (protocol) {
        case 'http:':
          return 80;
        case 'https:':
            return 443;
        case 'ftp:':
          return 21;
        default:
            return -1;
      }
}

module.exports.bootstrap = async (port) => {
    let configObj = config.get();
    if(configObj.cli.clientLibrary) {
        let clientLibUrl = await makeClientLibUrl(port);
        originalClientLib = patchHTMLFile(clientLibUrl, HOT_REL_LIB_PATCH_REGEX);
    }
    let globalsUrl = await makeGlobalsUrl(port);
    originalGlobals = patchHTMLFile(globalsUrl, HOT_REL_GLOB_PATCH_REGEX);
    utils.warn('Global variables patch was applied successfully. ' +
        'Please avoid sending keyboard interrupts.');
    utils.log(`You are working with your frontend library's development environment. ` +
        'Your frontend-library-based app will run with Neutralino and be able to use the Neutralinojs API.');
}

module.exports.cleanup = () => {
    if(originalClientLib) {
        patchHTMLFile(originalClientLib, HOT_REL_LIB_PATCH_REGEX);
    }
    if(originalGlobals) {
        patchHTMLFile(originalGlobals, HOT_REL_GLOB_PATCH_REGEX);
    }
    utils.log('Global variables patch was reverted.');
}


module.exports.runCommand = (commandKey) => {
    return new Promise((resolve, reject) => {
        let configObj = config.get();
        let frontendLib = configObj.cli?.frontendLibrary;

        if(frontendLib?.projectPath && frontendLib?.[commandKey]) {
            let projectPath = utils.trimPath(frontendLib.projectPath);
            let cmd = frontendLib[commandKey];

            utils.log(`Running ${commandKey}: ${cmd}...`);
            const proc = spawnCommand(cmd, { stdio: 'inherit', cwd: projectPath });
            proc.on('exit', (code) => {
                utils.log(`${commandKey} completed with exit code: ${code}`);
                resolve();
            });
        }
    });
}

module.exports.containsFrontendLibApp = () => {
    let configObj = config.get();
    return !!configObj.cli?.frontendLibrary;
}

module.exports.waitForFrontendLibApp = async () => {
    let configObj = config.get();
    let devUrlString = configObj.cli?.frontendLibrary?.devUrl;
    let url = new URL(devUrlString);
    let portString = url.port;
    let port = portString ? Number.parseInt(portString) : getPortByProtocol(url.protocol)
    if (port < 0) {
        utils.error(`Could not get frontendLibrary port of ${devUrlString} with protocol ${url.protocol}`);
        process.exit(1);
    }

    let inter = setInterval(() => {
        utils.log(`App will be launched when ${devUrlString} on port ${port} is ready...`);
    }, 500);

    try {
        await tpu.waitUntilUsed(port, 200, 10000);
    }
    catch(e) {
        utils.error(`Timeout exceeded while waiting till local TCP port: ${port}`);
        process.exit(1);
    }
    clearInterval(inter);
}
