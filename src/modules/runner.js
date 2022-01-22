const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const constants = require('../constants');

const EXEC_PERMISSION = 0o755;

function getBinaryName(arch) {
    let platform = process.platform;

    // Use x64 binary for M1 chip (arm64)
    // Translation is handled by macOS
    if(platform == 'darwin' && arch == 'arm64') {
        arch = 'x64';
    }

    if(!(platform in constants.files.binaries))
        return '';
    if(!(arch in constants.files.binaries[process.platform]))
        return '';
    return constants.files.binaries[process.platform][arch];
}

module.exports.runApp = async (options = {}) => {
    return new Promise((resolve, reject) => {
        let arch = options.arch || process.arch;
        let binaryName = getBinaryName(arch);

        if(!binaryName) {
            return reject(`Unsupported platform or CPU architecture: ${process.platform}_${arch}`);
        }

        let binaryPath = `bin${path.sep}${binaryName}`;
        let args = " --load-dir-res --path=. --export-auth-info --neu-dev-extension";
        if(options.argsOpt)
            args += " " + options.argsOpt;

        if(process.platform == 'linux' || process.platform == 'darwin')
            fs.chmodSync(binaryPath, EXEC_PERMISSION);

        console.log(`Starting process: ${binaryName} ${args}`);

        exec(binaryPath + args, (err, stdout, stderr) => {
            let statusCodeMsg = err ? `error code ${err.code}` : `success code 0`;
            console.log(`${binaryName} was stopped with ${statusCodeMsg}`);
            if(!options.verbose && err) {
                console.log('You can launch app with "neu run --verbose" to see the output coming from ' +
                            'the Neutralinojs process. The verbose option is helpful for detecting framework ' +
                            'initialization crashes.');
            }

            if(options.verbose) {
                if(stderr.trim()) {
                    console.log('--- STDERR ---');
                    console.log(stderr);
                }

                if(stdout.trim()) {
                    console.log('--- STDOUT ---');
                    console.log(stdout);
                }
            }
            resolve();
        });
    });
}
