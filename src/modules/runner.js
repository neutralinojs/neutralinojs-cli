const { exec } = require('child_process');
const chmod = require('chmod');

module.exports.runApp = (settingsObj, runSuccessCallback = null) => {
    let binaryCmd;
    switch (process.platform) {
        case 'win32':
            binaryCmd = `${settingsObj.appname}-win.exe --debug-mode`;
            break;
        case 'linux':
            binaryCmd = `./${settingsObj.appname}-linux --debug-mode`;
            chmod(`${settingsObj.appname}-linux`, 777);
            break;
        case 'darwin':
            binaryCmd = `./${settingsObj.appname}-mac --debug-mode`;
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