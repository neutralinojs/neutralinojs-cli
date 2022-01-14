const chalk = require('chalk');
const logwatcher = require('../modules/logwatcher');
const filewatcher = require('../modules/filewatcher');
const websocket = require('../modules/websocket');
const runner = require('../modules/runner');
const commons = require('../commons');

module.exports.register = (program) => {
    program
        .command('run')
        .option('--disable-auto-reload')
        .option('--hot-reload-workaround')
        .option('--arch <arch>')
        .option('--verbose')
        .action(async (command) => {
            commons.checkCurrentProject();
            let argsOpt = "";

            if(!command.disableAutoReload)
                argsOpt += "--neu-dev-auto-reload";

            let parseStopIndex = process.argv.indexOf('--');
            if(parseStopIndex != -1) {
                argsOpt += ' ' + process.argv
                                .slice(parseStopIndex + 1)
                                .join(' ');
            }

            if(!command.disableAutoReload) {
                filewatcher.start();
            }

            logwatcher.start();
            websocket.start({
                hotReload: command.hotReloadWorkaround
            });

            try {
                await runner.runApp({argsOpt,
                                    arch: command.arch,
                                    verbose: command.verbose});
            }
            catch(error) {
                console.log(`${chalk.bgRed.white('ERROR')} ${error}`);
            }

            filewatcher.stop();
            logwatcher.stop();
            websocket.stop();
        });
}
