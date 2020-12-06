const commons = require('../commons');
const bundler = require('../modules/bundler');

module.exports.register = (program) => {
    program
        .command('build')
        .option('-v, --verbose')
        .action((name, command) => {
            bundler.buildApp(() => {
                console.log('App build was successful!');
                commons.figlet();
            }, name.verbose);
        });
}

