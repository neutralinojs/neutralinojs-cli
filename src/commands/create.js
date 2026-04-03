const creator = require('../modules/creator');
const utils = require('../utils');

module.exports.register = (program) => {
   program
  .command('create <binaryName>')
  .description('creates an app based on template (neutralinojs/neutralinojs-minimal by default)')
  .option('-t, --template [template]')
  .addHelpText('after', `
Examples:
  neu create my_app
  neu create my_app --template neutralinojs/neutralinojs-minimal
`)
  .action(async (binaryName, command) => {
      await creator.createApp(binaryName, command.template);
      utils.showArt();
  });

}

