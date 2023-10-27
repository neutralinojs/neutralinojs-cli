const filewatcher = require('../modules/filewatcher');
const websocket = require('../modules/websocket');
const runner = require('../modules/runner');
const utils = require('../utils');
const config = require('../modules/config');
const frontendlib = require('../modules/frontendlib');

module.exports.register = (program) => {
    program
        .command('run')
        .description('fetches config from neutralino.config.json & runs the app')
        .option('--disable-auto-reload')
        .option('--arch <arch>')
        .action(async (command) => {
            utils.checkCurrentProject();
            let configObj = config.get();
            let containsFrontendLibApp = frontendlib.containsFrontendLibApp();
            let argsOpt = "";

            if(containsFrontendLibApp) {
                frontendlib.runCommand('devCommand');
                await frontendlib.waitForFrontendLibApp();
            }

            if(!command.disableAutoReload && !containsFrontendLibApp) {
                argsOpt += "--neu-dev-auto-reload";
                filewatcher.start();
            }

            websocket.start({
                frontendLibDev: containsFrontendLibApp
            });

            // Add additional process ARGs that comes after --
            let parseStopIndex = process.argv.indexOf('--');
            if(parseStopIndex != -1) {
                argsOpt += ' ' + process.argv
                                .slice(parseStopIndex + 1)
                                .join(' ');
            }

            if(containsFrontendLibApp && configObj.cli.frontendLibrary.devUrl) {
                argsOpt += ` --url=${configObj.cli.frontendLibrary.devUrl}`
            }

            try {
                await runner.runApp({argsOpt,
                                    arch: command.arch});
            }
            catch(error) {
                utils.log(error);
            }

            filewatcher.stop();
            websocket.stop();
        });
}
