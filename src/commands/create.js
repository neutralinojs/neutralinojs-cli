const creator = require('../modules/creator');
const utils = require('../utils');

module.exports.register = (program) => {
    program
        .command('create <binaryName>')
        .description('creates an app based on template (neutralinojs/neutralinojs-minimal by default)')
        .option('-t, --template [template]')
        .option('-p, --proxy [proxy]', 'specify proxy URL for downloading templates')
        .action(async (binaryName, command) => {
            await creator.createApp(binaryName, command.template, command.proxy);
            utils.showArt();
        });
}
