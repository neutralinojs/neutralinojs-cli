const creator = require('../modules/creator');
const utils = require('../utils');

module.exports.register = (program) => {
    program
        .command('create <binaryName>')
        .option('-t, --template [template]')
        .action(async (binaryName, command) => {
            await creator.createApp(binaryName, command.template);
            utils.figlet();
        });
}

