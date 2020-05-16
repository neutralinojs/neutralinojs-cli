const creator = require('../modules/creator');

module.exports.register = (program) => {
    program
        .command('create <name>')
        .option('-t, --template [templatename]')
        .action((name, command) => {
            creator.createApp(name, command.template);
        });
}

