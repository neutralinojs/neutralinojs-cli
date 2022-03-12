const creator = require('../modules/creator');
const utils = require('../utils');
const path = require('path');

module.exports.register = (program) => {
    program
        .command('create <binaryName>')
        .option('-t, --template [template]')
        .action(async (binaryName, command) => {
            let projectPath = path.resolve(binaryName);
            binaryName = path.basename(path.resolve(process.cwd(), binaryName));
            await creator.createApp(binaryName, projectPath, command.template);
            utils.figlet();
        });
}

