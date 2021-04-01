const logwatcher = require('../modules/logwatcher');
const filewatcher = require('../modules/filewatcher');
const runner = require('../modules/runner');

module.exports.register = (program) => {
    program
        .command('listen')
        .action((command) => {
            runner.runApp(() => {
                logwatcher.stop();
                filewatcher.stop();
                console.log(`Application was terminated.`);
            }, "--debug-mode");
            logwatcher.start();
            filewatcher.start();
        });
}

