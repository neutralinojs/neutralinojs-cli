const creator = require('../modules/creator');
const commons = require('../commons');

module.exports.register = (program) => {
    program
        .command('create <binaryName>')
        .option('-t, --template [templatename]')
        .action(async (binaryName, command) => {
            await creator.createApp(binaryName, command.template);
            commons.figlet();
        });
}

