const creator = require('../modules/creator');
const utils = require('../utils');
const path = require('path');

module.exports.register = (program) => {
    program
        .command('create <binaryName>')
        .option('-t, --template [template]')
        .action(async (binaryName, command) => {
            binaryName = path.basename(path.resolve(binaryName))
            await creator.createApp(binaryName, command.template);
            utils.figlet();
        });
}

