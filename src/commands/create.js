program
  .command('create <binaryName>')
  .description('creates an app based on template (neutralinojs/neutralinojs-...)')
  .option('-t, --template [template]')
  .addHelpText('after', `
Examples:
  $ neu create myapp
  $ neu create myapp --template neutralinojs/neutralinojs-zero
`)
  .action(async (binaryName, command) => {
    await creator.createApp(binaryName, command.template);
    utils.showArt();
  });