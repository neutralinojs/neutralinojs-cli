const creator = require('../modules/creator');
const utils = require('../utils');

module.exports.register = (program) => {
    program
        .command('create <binaryName>')
        .description('creates a app based on template (neutralinojs-minimal by default)')
        .option('-t, --template [template]')
        .action(async (binaryName, command) => {
            await creator.createApp(binaryName, command.template);
            utils.figlet();
        });
}

