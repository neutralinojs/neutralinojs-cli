const { exec } = require('child_process');
const chmod = require('chmod');
const fse = require('fs-extra');
const settings = require('./settings');

module.exports.runApp = async (argsOpt = null) => {
    return new Promise((resolve, reject) => {
        let settingsObj = settings.get();
        let binaryName = settingsObj.cli.binaryName;
        let binaryPath;
        let args = " --load-dir-res --path=.";
        if(argsOpt)
            args += " " + argsOpt;
    
        switch (process.platform) {
            case 'win32':
                binaryPath = fse.existsSync(`bin`) ? `bin\\neutralino-win.exe` : `${binaryName}-win.exe`;
                break;
            case 'linux':
                binaryPath = fse.existsSync(`bin`) ? `bin/neutralino-linux` : `${binaryName}-linux`;
                chmod(binaryPath, { execute: true });
                break;
            case 'darwin':
                binaryPath = fse.existsSync(`bin`) ? `bin/neutralino-mac` : `${binaryName}-mac`;
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
