const logwatcher = require('../modules/logwatcher');
const filewatcher = require('../modules/filewatcher');
const runner = require('../modules/runner');
const settings = require('../modules/settings');

module.exports.register = (program) => {
    program
        .command('listen')
        .option('--auto-build')
        .action((command) => {
            let settingsObj = settings.get();
            runner.runApp(settingsObj, () => {
                logwatcher.stop();
                filewatcher.stop();
                console.log(`${settingsObj.appname} was terminated.`);
            }, "--debug-mode");
            logwatcher.start();
            filewatcher.start(command.autoBuild);
        });
}

