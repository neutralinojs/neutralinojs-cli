const filewatcher = require('../modules/filewatcher');
const websocket = require('../modules/websocket');
const runner = require('../modules/runner');
const utils = require('../utils');
const config = require('../modules/config');
const frontendlib = require('../modules/frontendlib');
const hostproject = require('../modules/hostproject');

function wrapWithQuotes(arg) {
    if (arg.includes(' ') && !arg.startsWith('"') && !arg.endsWith('"')) {
        return `"${arg}"`;
    }
    return arg;
}

module.exports.register = (program) => {
    program
        .command('run')
        .description('fetches config from neutralino.config.json & runs the app')
        .option('--disable-auto-reload')
        .option('--arch <arch>')
        .action(async (command) => {
            utils.checkCurrentProject();
            let configObj = config.get();

            if(hostproject.hasHostProject()) {
                return hostproject.runCommand('devCommand');
            }

            let containsFrontendLibApp = frontendlib.containsFrontendLibApp();
            let argsOpt = "";

            websocket.start({
                frontendLibDev: containsFrontendLibApp
            });
            
            if(containsFrontendLibApp) {
                frontendlib.runCommand('devCommand');
                await frontendlib.waitForFrontendLibApp();
            }

            if(!command.disableAutoReload && !containsFrontendLibApp) {
                argsOpt += "--neu-dev-auto-reload";
                filewatcher.start();
            }

            // Add additional process ARGs that comes after --
            let parseStopIndex = process.argv.indexOf('--');
            if(parseStopIndex != -1) {
                argsOpt += ' ' + process.argv
                                .slice(parseStopIndex + 1)
                                .map(wrapWithQuotes)
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
