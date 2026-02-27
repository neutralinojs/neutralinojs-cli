program
  .command('create [binaryName]')
  .description('creates an app based on template (neutralinojs/neutralinojs-...)')
  .option('-t, --template [template]')
  .addHelpText('after', `
Examples:
  $ neu create myapp
  $ neu create myapp --template neutralinojs/neutralinojs-zero
`)
  .action(async (binaryName, command) => {
  if (!binaryName) {
    console.log('\nUsage:\n  neu create <binaryName>\n');
    console.log('Example:\n  neu create my_app\n');
    process.exit(1);
  }

  await creator.createApp(binaryName, command.template);
  utils.showArt();
});