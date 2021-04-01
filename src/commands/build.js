const commons = require('../commons');
const bundler = require('../modules/bundler');

module.exports.register = (program) => {
    program
        .command('build')
        .option('-r, --release')
        .action((name, command) => {
            bundler.bundleApp(name.release, () => {
                console.log('Please check the ./dist directory!');
                commons.figlet();
            });
        });
}

