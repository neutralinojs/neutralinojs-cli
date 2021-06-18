const { exec } = require('child_process');
const chmod = require('chmod');
const fse = require('fs-extra');

module.exports.runApp = async (argsOpt = null) => {
    return new Promise((resolve, reject) => {
        let binaryPath;
        let args = " --load-dir-res --path=.";
        if(argsOpt)
            args += " " + argsOpt;
    
        switch (process.platform) {
            case 'win32':
                binaryPath = 'bin\\neutralino-win.exe';
                break;
            case 'linux':
                binaryPath = 'bin/neutralino-linux';
                chmod(binaryPath, { execute: true });
                break;
            case 'darwin':
                binaryPath = 'bin/neutralino-mac';
                chmod(binaryPath, { execute: true });
                break;
        }
        exec(binaryPath + args, (err, stdout, stderr) => {
            if (err) {
                reject(stderr);
            }
            else {
                resolve();
            }
        });
    });
}
