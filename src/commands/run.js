const contants = require('../contants');
const { exec } = require('child_process');
const commons = require('../commons');
const settings = require('../modules/settings');

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
                    break;
                case 'darwin':
                    binaryCmd = `./${settingsObj.appname}-mac`;
                    break;
            }
            exec(binaryCmd, (err, stdout, stderr) => {
                if (err) {
                    console.error(stderr);
                }
                console.log(`${settingsObj.appname} was terminated.`);
            });


        });
}

