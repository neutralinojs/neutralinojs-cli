const { exec } = require('child_process');
const settings = require('../modules/settings');
const logwatcher = require('../modules/logwatcher');
const chmod = require('chmod');

module.exports.register = (program) => {
    program
        .command('run')
        .action(() => {
            let binaryCmd;
            let settingsObj = settings.get();
            switch (process.platform) {
                case 'win32':
                    binaryCmd = `${settingsObj.appname}-win.exe`;
                    break;
                case 'linux':
                    binaryCmd = `./${settingsObj.appname}-linux`;
                    chmod(`${settingsObj.appname}-linux`, 777);
                    break;
                case 'darwin':
                    binaryCmd = `./${settingsObj.appname}-mac`;
                    chmod(`${settingsObj.appname}-mac`, 777);
                    break;
            }
            exec(binaryCmd, (err, stdout, stderr) => {
                if (err) {
                    console.error(stderr);
                }
                logwatcher.stop();
                console.log(`${settingsObj.appname} was terminated.`);
            });
            logwatcher.start();

        });
}

