const commons = require('../commons');
const settings = require('../modules/settings');
const bundler = require('../modules/bundler');

module.exports.register = (program) => {
    program
        .command('release')
        .action(() => {
            let settingsObj = settings.get();
            bundler.bundleApp(settingsObj);
            commons.figlet(() => {
                console.log(`app was released to dist`);
            });
        });
}

