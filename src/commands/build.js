const commons = require('../commons');
const bundler = require('../modules/bundler');

module.exports.register = (program) => {
    program
        .command('build')
        .option('-r, --release')
        .option('--copy-storage')
        .action(async (command) => {
            commons.checkCurrentProject();
            console.log('Bundling app...');
            await bundler.bundleApp(command.release, command.copyStorage);
            commons.figlet();
            console.log('Please check the ./dist directory!');
        });
}

