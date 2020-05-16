const commons = require('../commons');
const bundler = require('../modules/bundler');

module.exports.register = (program) => {
    program
        .command('build')
        .action((name, command) => {
            bundler.buildApp(() => {
                console.log('App build was successful!');
                commons.figlet();
            });
        });
}

