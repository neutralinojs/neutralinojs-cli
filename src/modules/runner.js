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
            binaryCmd = `bin\\neutralino-win.exe${args}`;
            break;
        case 'linux':
            binaryCmd = `bin/neutralino-linux${args}`;
            chmod(`bin/neutralino-linux`, 777);
            break;
        case 'darwin':
            binaryCmd = `bin/neutralino-mac${args}`;
            chmod(`bin/neutralino-mac`, 777);
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
