const commons = require('../commons');
const bundler = require('../modules/bundler');

module.exports.register = (program) => {
    program
        .command('build')
        .option('-r, --release')
        .action(async (command) => {
            commons.checkCurrentProject();
            console.log('Bundling app...');
            await bundler.bundleApp(command.release);
            console.log('Please check the ./dist directory!');
            commons.figlet();
        });
}

