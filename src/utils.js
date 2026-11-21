const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const process = require('process');
const exec = require('child_process').exec;
const chalk = require('chalk');
const constants = require('./constants');
let getConfigFile = () => constants.files.configFile;
const config = require('./modules/config')
const package = require('../package.json')

let error = (message) => {
    console.error(`neu: ${chalk.bgRed.black('ERRR')} ${message}`);
}

let isNeutralinojsProject = (parent = '.') => {
    return fs.existsSync(parent + '/' + getConfigFile());
}

let getFiglet = () => {
    const neutralinoText =
 `  _   _            _             _ _             _
 | \\ | | ___ _   _| |_ _ __ __ _| (_)_ __   ___ (_)___
 |  \\| |/ _ \\ | | | __| '__/ _' | | | '_ \\ / _ \\| / __|
 | |\\  |  __/ |_| | |_| | | (_| | | | | | | (_) | \\__ \\
 |_| \\_|\\___|\\__,_|\\__|_|  \\__,_|_|_|_| |_|\\___// |___/
                                               |__/`;

    return neutralinoText;
}

let showArt = () => {
    console.log(getFiglet());
}

let checkCurrentProject = () => {
    if (!isNeutralinojsProject()) {
        error(`Unable to find ${getConfigFile()}. ` +
            `Please check whether the current directory has a Neutralinojs project.`);
        process.exit(1);
    }
    const configObj = config.get();
    if(Object.keys(configObj).length == 0) {
        error(`${getConfigFile()} is not a valid Neutralinojs configuration JSON file.`);
        process.exit(1);
    }
}

let checkLatestVersion = () => {
    return new Promise((resolve) => {
        exec(`npm view ${package.name} version`, (err, versionInfo) => {
            let latestVersion = versionInfo.trim();
            if (!err && package.version !== latestVersion) {
                warn(`You are using an older neu CLI version. Install the latest version ` +
                    `by entering 'npm install -g ${package.name}'`);
                resolve(false);
            }
            resolve(true);
        });
    });
}


let log = (message) => {
    console.log(`neu: ${chalk.bgGreen.black('INFO')} ${message}`);
}

let warn = (message) => {
    console.warn(`neu: ${chalk.bgYellow.black('WARN')} ${message}`);
}

let trimPath = (path) => {
    return path ? path.replace(/^\//, '') : path;
}

let clearDirectory = (path) => {
    fse.removeSync(path);
}

let getVersionTag = (version) => {
    return version != 'nightly' ? 'v' + version : version;
}

let filterFiles = (src, pattern) => {
    if(!Array.isArray(pattern)) pattern = [pattern];
    const regex = new RegExp(pattern.join('|'));
    const found = src.match(regex);
    return !found;
}

let validateProjectPath = (projectPath, projectRoot = '.') => {
    try {
        let rawPath = trimPath(projectPath) || '.';
        let rootPath = path.resolve(projectRoot);
        if (!fs.existsSync(rootPath)) {
            return { valid: false, error: `Project directory '${rootPath}' does not exist.` };
        }
        let realRoot = fs.realpathSync(rootPath);
        let targetPath = path.resolve(rootPath, rawPath);

        // First check logical path resolution (catches relative escapes like ../.. even if target doesn't exist)
        let checkRoot = process.platform === 'win32' ? rootPath.toLowerCase() : rootPath;
        let checkTarget = process.platform === 'win32' ? targetPath.toLowerCase() : targetPath;
        let sep = path.sep;
        let isLogicallyInside = checkTarget === checkRoot || checkTarget.startsWith(checkRoot + sep);
        if (!isLogicallyInside) {
            return { valid: false, error: `Security error: projectPath '${projectPath}' resolves outside the project directory.` };
        }

        if (!fs.existsSync(targetPath)) {
            return { valid: false, error: `Directory '${rawPath}' does not exist.` };
        }

        // Second check real paths with fs.realpathSync (catches symlink escapes)
        let realTarget = fs.realpathSync(targetPath);
        let realCheckRoot = process.platform === 'win32' ? realRoot.toLowerCase() : realRoot;
        let realCheckTarget = process.platform === 'win32' ? realTarget.toLowerCase() : realTarget;
        let isRealInside = realCheckTarget === realCheckRoot || realCheckTarget.startsWith(realCheckRoot + sep);
        if (!isRealInside) {
            return { valid: false, error: `Security error: projectPath '${projectPath}' resolves outside the project directory.` };
        }

        return { valid: true, targetDir: realTarget };
    } catch (e) {
        return { valid: false, error: `Invalid project path: ${e.message}` };
    }
};

module.exports = {
    error,
    isNeutralinojsProject,
    getFiglet,
    showArt,
    checkCurrentProject,
    checkLatestVersion,
    log,
    warn,
    trimPath,
    getVersionTag,
    clearDirectory,
    filterFiles,
    validateProjectPath
}
