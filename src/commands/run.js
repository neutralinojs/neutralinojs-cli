const logwatcher = require('../modules/logwatcher');
const runner = require('../modules/runner');

module.exports.register = (program) => {
    program
        .command('run')
        .action(() => {
            runner.runApp(() => {
                logwatcher.stop();
                console.log(`Application was terminated.`);
            });
            logwatcher.start();
        });
}

