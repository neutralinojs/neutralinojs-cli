const utils = require('../utils');
const bundler = require('../modules/bundler');
const config = require('../modules/config');
const constants = require('../constants');

module.exports.register = (program) => {
    program
        .command('build')
        .description('builds binaries for all supported platforms and resources.neu file')
        .option('-r, --release')
        .option('--embed-resources', 'embed resources in the binary')
        .option('--config-file <path>', 'specify the *.config.json file')
        .option('--copy-storage')
        .option('--clean')
        .option('--macos-bundle')
        .option('--platform <list>', 'build only for specific platforms (windows, linux, mac)')
        .option('--plan', 'show what would be built without building')
        .action(async (command) => {
            if(command.configFile) {
              utils.log(`Using config file: ${command.configFile}`);
              constants.files.configFile = command.configFile;
            }

            utils.checkCurrentProject();
            const configObj = config.get();
            const buildDir = configObj.cli.distributionPath
                ? utils.trimPath(configObj.cli.distributionPath)
                : 'dist';

            const platforms = command.platform
                ? command.platform.split(',').map(p => p.trim())
                : null; // null = existing behavior (all platforms)

            // PLAN MODE (no side effects)
            if (command.plan) {
                utils.showArt();

                const targets = platforms || ['windows', 'linux', 'mac'];

                console.log('Build plan:\n');
                console.log(`Project: ${configObj.cli.binaryName}`);
                console.log(`Distribution directory: ${buildDir}`);
                console.log(`Release mode: ${!!command.release}`);
                console.log(`Embed resources: ${!!command.embedResources}`);
                console.log(`macOS bundle: ${!!command.macosBundle}\n`);

                console.log('Targets:');
                targets.forEach(t => console.log(`  - ${t}`));

                console.log(`\nSummary:`);
                console.log(`  ${targets.length} binaries will be generated.\n`);
                console.log('hint: Run `neu build` to execute this plan.');
                return;
            }

            // EXISTING BEHAVIOR (unchanged when no new flags are used)
            if(command.clean) {
                utils.log(`Cleaning previous build files from ${buildDir}...`);
                utils.clearDirectory(buildDir);
            }

            utils.log('Bundling app...');
            await bundler.bundleApp({
                release: command.release,
                embedResources: command.embedResources,
                copyStorage: command.copyStorage,
                macosBundle: command.macosBundle,
                platforms // null = old behavior, array = filtered platforms
            });

            utils.showArt();
            utils.log(`Application package was generated at the ${buildDir} directory!`);
            utils.log('Distribution guide: https://neutralino.js.org/docs/distribution/overview');
        });
};
