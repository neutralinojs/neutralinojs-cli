const chalk = require('chalk');
const logwatcher = require('../modules/logwatcher');
const filewatcher = require('../modules/filewatcher');
const websocket = require('../modules/websocket');
const runner = require('../modules/runner');
const commons = require('../commons');
const config = require('../modules/config');

module.exports.register = (program) => {
    program
        .command('run')
        .option('--disable-auto-reload')
        .option('--use-frontend-lib')
        .option('--arch <arch>')
        .option('--verbose')
        .action(async (command) => {
            commons.checkCurrentProject();
            let configObj = config.get();
            let argsOpt = "";

            if(!command.disableAutoReload && !command.useFrontendLib) {
                argsOpt += "--neu-dev-auto-reload";
                filewatcher.start();
            }

            logwatcher.start();
            websocket.start({
                useFrontendLib: command.useFrontendLib
            });

            // Add additional process ARGs that comes after --
            let parseStopIndex = process.argv.indexOf('--');
            if(parseStopIndex != -1) {
                argsOpt += ' ' + process.argv
                                .slice(parseStopIndex + 1)
                                .join(' ');
            }

            if(command.useFrontendLib && configObj.cli.frontendLibrary.devUrl) {
                argsOpt += ` --url=${configObj.cli.frontendLibrary.devUrl}`
            }

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
