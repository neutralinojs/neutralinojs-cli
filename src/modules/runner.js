const { exec } = require('child_process');
const chmod = require('chmod');
const settings = require('./settings');

module.exports.runApp = (runSuccessCallback = null, argsOpt = "") => {
    let settingsObj = settings.get();
    let binaryCmd;
    let args = " --load-dir-res";
    if(argsOpt.length > 0)
        args += " " + argsOpt;
    switch (process.platform) {
        case 'win32':
            binaryCmd = `${settingsObj.binaryName}-win.exe${args}`;
            break;
        case 'linux':
            binaryCmd = `./${settingsObj.binaryName}-linux${args}`;
            chmod(`${settingsObj.binaryName}-linux`, 777);
            break;
        case 'darwin':
            binaryCmd = `./${settingsObj.binaryName}-mac${args}`;
            chmod(`${settingsObj.binaryName}-mac`, 777);
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
