const filewatcher = require('../modules/filewatcher');
const websocket = require('../modules/websocket');
const runner = require('../modules/runner');
const utils = require('../utils');
const config = require('../modules/config');
const frontendlib = require('../modules/frontendlib');
const hostproject = require('../modules/hostproject');
const path = require('path');
const fs = require('fs');

function wrapWithQuotes(arg) {
    if (arg.includes(' ') && !arg.startsWith('"') && !arg.endsWith('"')) {
        return `"${arg}"`;
    }
    return arg;
}

function warnIfResourcesMissing() {
    const resourcesPath = path.join(process.cwd(), 'resources');

    if (!fs.existsSync(resourcesPath)) {
        utils.warn(
            'No `resources/` directory found. ' +
            'Some runtime resource warnings may appear during `neu run`.\n' +
            'This is usually safe for new projects. ' +
            'If the app does not load correctly, try running `neu build`.'
        );
        return;
    }

    const expectedFiles = [
        path.join(resourcesPath, 'favicon.ico'),
        path.join(resourcesPath, '.well-known', 'appspecific', 'com.chrome.devtools.json')
    ];

    const missing = expectedFiles.filter(p => !fs.existsSync(p));

    if (missing.length > 0) {
       utils.warn(
    'Some common application resources are missing.\n' +
    'You may see runtime warnings during `neu run`.\n' +
    'If the app does not load correctly, check the `resources/` directory ' +
    'or try running `neu build`.'
);

    }
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
                frontendLibDev: containsFrontendLibApp && configObj.cli.frontendLibrary.patchFile
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

           warnIfResourcesMissing();

try {
    await runner.runApp({
        argsOpt,
        arch: command.arch
    });
}
catch(error) {
    utils.log(error);
}


            filewatcher.stop();
            websocket.stop();
        });
}
