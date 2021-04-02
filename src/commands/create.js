const creator = require('../modules/creator');

module.exports.register = (program) => {
    program
        .command('create <binaryName>')
        .option('-t, --template [templatename]')
        .action((binaryName, command) => {
            creator.createApp(binaryName, command.template);
        });
}

