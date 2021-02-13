const { exec } = require('child_process');
const chmod = require('chmod');

module.exports.runApp = (settingsObj, runSuccessCallback = null, argsOpt = "") => {
    let binaryCmd;
    let args = " --load-dir-res";
    if(argsOpt.length > 0)
        args += " " + argsOpt;
    switch (process.platform) {
        case 'win32':
            binaryCmd = `${settingsObj.appname}-win.exe${args}`;
            break;
        case 'linux':
            binaryCmd = `./${settingsObj.appname}-linux${args}`;
            chmod(`${settingsObj.appname}-linux`, 777);
            break;
        case 'darwin':
            binaryCmd = `./${settingsObj.appname}-mac${args}`;
            chmod(`${settingsObj.appname}-mac`, 777);
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
