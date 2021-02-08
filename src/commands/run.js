const logwatcher = require('../modules/logwatcher');
const runner = require('../modules/runner');
const settings = require('../modules/settings');

module.exports.register = (program) => {
    program
        .command('run')
        .action(() => {
            let settingsObj = settings.get();
            runner.runApp(settingsObj, () => {
                logwatcher.stop();
                console.log(`${settingsObj.appname} was terminated.`);
            }, '--load-dir-res');
            logwatcher.start();
        });
}

