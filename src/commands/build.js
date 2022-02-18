const utils = require('../utils');
const bundler = require('../modules/bundler');

module.exports.register = (program) => {
    program
        .command('build')
        .option('-r, --release')
        .option('--copy-storage')
        .action(async (command) => {
            utils.checkCurrentProject();
            utils.log('Bundling app...');
            await bundler.bundleApp(command.release, command.copyStorage);
            utils.figlet();
            utils.log('Application package was generated at the ./dist directory!');
        });
}

