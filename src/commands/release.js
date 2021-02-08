const commons = require('../commons');
const settings = require('../modules/settings');
const bundler = require('../modules/bundler');

module.exports.register = (program) => {
    program
        .command('release')
        .action(async () => {
            let settingsObj = settings.get();
            await bundler.bundleApp(settingsObj);
            console.log(`${settingsObj.appname} was released to dist`);
            commons.figlet();
        });
}

