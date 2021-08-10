const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const constants = require('../constants');

const EXEC_PERMISSION = 0o755;

function getBinaryName() {
    if(!(process.platform in constants.files.binaries))
        return "";
    if(!(process.arch in constants.files.binaries[process.platform]))
        return "";
    return constants.files.binaries[process.platform][process.arch];
}

module.exports.runApp = async (argsOpt = null) => {
    return new Promise((resolve, reject) => {
        let binaryName = getBinaryName();
        if(!binaryName)
            console.log(`${chalk.bgRed.white('ERROR')} Unsupported platform or CPU architecture: 
                    ${process.platform}_${process.arch}`);

        let binaryPath = `bin${path.sep}${binaryName}`;
        let args = " --load-dir-res --path=.";
        if(argsOpt)
            args += " " + argsOpt;

        if(process.platform == 'linux' || process.platform == 'darwin')
            fs.chmodSync(binaryPath, EXEC_PERMISSION);
    
        console.log(`Starting process: ${binaryName} ${args}`);
        exec(binaryPath + args, (err, stdout, stderr) => {
            console.log(`${binaryName} was stopped.`);
            resolve(); // TODO: Fix Neutralinojs.app.exit issue, After that, reject() for err
        });
    });
}
