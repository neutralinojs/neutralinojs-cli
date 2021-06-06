const logwatcher = require('../modules/logwatcher');
const runner = require('../modules/runner');

module.exports.register = (program) => {
    program
        .command('run')
        .option('--mode <mode>')
        .action(async (command) => {
            let optArgs = null;
            if(command.mode)
                optArgs = `--mode=${command.mode}`;
            
            logwatcher.start();
            await runner.runApp(optArgs);
            logwatcher.stop();
            console.log(`Application was terminated.`);
        });
}

