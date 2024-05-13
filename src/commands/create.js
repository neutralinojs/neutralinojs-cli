const creator = require('../modules/creator');
const utils = require('../utils');

module.exports.register = (program) => {
    program
        .command('create <binaryName>')
        .description('creates an app based on template (neutralinojs/neutralinojs-minimal by default)')
        .option('-t, --template [template]')
        .action(async (binaryName, command) => {
            await creator.createApp(binaryName, command.template);
            utils.showArt();
        });
}

