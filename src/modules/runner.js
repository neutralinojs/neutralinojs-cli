const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const constants = require('../constants');

const EXEC_PERMISSION = 0o755;

function getBinaryName() {
    let platform = process.platform;
    let arch = process.arch;

    // Use x64 binary for M1 chip (arm64)
    // Translation is handdle by macOS
    if(platform == 'darwin' && arch == 'arm64') {
        arch = 'x64';
    }

    if(!(platform in constants.files.binaries))
        return '';
    if(!(arch in constants.files.binaries[process.platform]))
        return '';
    return constants.files.binaries[process.platform][arch];
}

module.exports.runApp = async (argsOpt = null) => {
    return new Promise((resolve, reject) => {
        let binaryName = getBinaryName();
        if(!binaryName) {
            console.log(`${chalk.bgRed.white('ERROR')} Unsupported platform or CPU architecture: 
                    ${process.platform}_${process.arch}`);
            return reject();
        }

        let binaryPath = `bin${path.sep}${binaryName}`;
        let args = " --load-dir-res --path=.";
        if(argsOpt)
            args += " " + argsOpt;

        if(process.platform == 'linux' || process.platform == 'darwin')
            fs.chmodSync(binaryPath, EXEC_PERMISSION);
    
        console.log(`Starting process: ${binaryName} ${args}`);
        exec(binaryPath + args, (err, stdout, stderr) => {
            let statusCodeMsg = err ? `error code ${err.code}` : `success code 0`;
            console.log(`${binaryName} was stopped with ${statusCodeMsg}`);
            resolve();
        });
    });
}
