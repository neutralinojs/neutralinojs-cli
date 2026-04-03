const spawnCommand = require('spawn-command');
const fs = require('fs');
const path = require('path');
const frontendlib = require('./frontendlib');
const constants = require('../constants');
const utils = require('../utils');

const EXEC_PERMISSION = 0o755;

function getBinaryName(arch) {
    let platform = process.platform;

    if (!(platform in constants.files.binaries))
        return '';
    if (!(arch in constants.files.binaries[process.platform]))
        return '';
    return constants.files.binaries[process.platform][arch];
}

module.exports.runApp = async (options = {}) => {
    return new Promise((resolve, reject) => {
        let arch = options.arch || process.arch;
        let binaryName = getBinaryName(arch);

        if (!binaryName) {
            return reject(`Unsupported platform or CPU architecture: ${process.platform}_${arch}`);
        }

        let binaryPath = `bin${path.sep}${binaryName}`;
        let args = " --load-dir-res --path=. --export-auth-info --neu-dev-extension";
        if (options.argsOpt)
            args += " " + options.argsOpt;

        if (process.platform == 'linux' || process.platform == 'darwin')
            fs.chmodSync(binaryPath, EXEC_PERMISSION);

        utils.log(`Starting process: ${binaryName} ${args}`);

        const neuProcess = spawnCommand(binaryPath + args);

        neuProcess.stdout.on('data', (data) => {
            process.stdout.write(data);
        });
        let errorOutput = '';
        neuProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            process.stderr.write(data);
        });
        neuProcess.on('exit', function (code) {
            let statusCodeMsg = code ? `error code ${code}` : `success code 0`;
            let runnerMsg = `${binaryName} was stopped with ${statusCodeMsg}`;

            if (code) {
                utils.warn(runnerMsg);
                if (errorOutput.trim()) {
                    console.error(`\n[CRASH DETAILS]:\n${errorOutput.trim()}\n`);
                }
            }
            else {
                utils.log(runnerMsg);
            }

            resolve();
        });
    });
}
