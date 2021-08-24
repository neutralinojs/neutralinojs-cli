const logwatcher = require('../modules/logwatcher');
const filewatcher = require('../modules/filewatcher');
const runner = require('../modules/runner');
const commons = require('../commons');

module.exports.register = (program) => {
    program
        .command('run')
        .option('--mode <mode>')
        .option('--disable-auto-reload')
        .action(async (command) => {
            commons.checkCurrentProject();
            let optArgs = "";
            
            if(!command.disableAutoReload)
                optArgs += "--debug-mode";
            
            if(command.mode)
                optArgs += ` --mode=${command.mode}`;

            if(!command.disableAutoReload)
                filewatcher.start();

            logwatcher.start();
            await runner.runApp(optArgs);
            filewatcher.stop();
            logwatcher.stop();
        });
}

