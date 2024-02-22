const utils = require('../utils');
const bundler = require('../modules/bundler');

module.exports.register = (program) => {
    program
        .command('build')
        .description('builds binaries for all supported platforms and resources.neu file')
        .option('-r, --release')
        .option('--copy-storage')
        .action(async (command) => {
            utils.checkCurrentProject();
            utils.log('Removing current build');
            utils.clearBuild();
            utils.log('Bundling app...');
            await bundler.bundleApp(command.release, command.copyStorage);
            utils.showArt();
            utils.log('Application package was generated at the ./dist directory!');
            utils.log('Distribution guide: https://neutralino.js.org/docs/distribution/overview');
        });
}

