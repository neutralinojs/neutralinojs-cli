const logwatcher = require('../modules/logwatcher');
const filewatcher = require('../modules/filewatcher');
const runner = require('../modules/runner');
const commons = require('../commons');

module.exports.register = (program) => {
    program
        .command('listen')
        .option('--mode <mode>')
        .action(async (command) => {
            commons.checkCurrentProject();
            let optArgs = "--debug-mode";
            if(command.mode)
                optArgs += ` --mode=${command.mode}`;
            logwatcher.start();
            filewatcher.start();
            await runner.runApp(optArgs);
            logwatcher.stop();
            filewatcher.stop();
            console.log(`Application was terminated.`);
        });
}

