const { exec } = require('child_process');
const chmod = require('chmod');
const settings = require('./settings');

module.exports.runApp = (runSuccessCallback = null, argsOpt = "") => {
    let settingsObj = settings.get();
    let binaryName = settingsObj.cli.binaryName;
    let binaryCmd;
    let args = " --load-dir-res";
    if(argsOpt.length > 0)
        args += " " + argsOpt;
    switch (process.platform) {
        case 'win32':
            binaryCmd = `${binaryName}-win.exe${args}`;
            break;
        case 'linux':
            binaryCmd = `./${binaryName}-linux${args}`;
            chmod(`${binaryName}-linux`, 777);
            break;
        case 'darwin':
            binaryCmd = `./${binaryName}-mac${args}`;
            chmod(`${binaryName}-mac`, 777);
            break;
    }
    exec(binaryCmd, (err, stdout, stderr) => {
        if (err) {
            console.error(stderr);
        }
        if(runSuccessCallback)
            runSuccessCallback();
    });
}
