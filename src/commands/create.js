const creator = require('../modules/creator');
const utils = require('../utils');

module.exports.register = (program) => {
    program
        .command('create <binaryName>')
        .description('creates an app based on template (neutralinojs/neutralinojs-minimal by default)')
        .option('-t, --template [template]')
        .option('--run-init', 'run template initCommand without confirmation')
        .option('-y, --yes', 'skip confirmation prompts and run initCommand')
        .option('--no-init', 'skip running template initCommand')
        .action(async (binaryName, command) => {
            await creator.createApp(binaryName, command.template, {
                runInit: Boolean(command.runInit || command.yes),
                noInit: command.init === false
            });
            utils.showArt();
        });
}

