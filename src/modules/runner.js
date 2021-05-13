const { exec } = require('child_process');
const chmod = require('chmod');
const fse = require('fs-extra');
const settings = require('./settings');

module.exports.runApp = (runSuccessCallback = null, argsOpt = "") => {
    let settingsObj = settings.get();
    let binaryName = settingsObj.cli.binaryName;
    let binaryPath;
    let args = " --load-dir-res";
    if(argsOpt.length > 0)
        args += " " + argsOpt;
    process.env.NL_PATH = "..";
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
            console.error(stderr);
        }
        if(runSuccessCallback)
            runSuccessCallback();
    });
}
