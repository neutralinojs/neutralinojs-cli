const utils = require('../utils');
const bundler = require('../modules/bundler');
const config = require('../modules/config');
const constants = require('../constants');
const frontendlib = require('../modules/frontendlib');

module.exports.register = (program) => {
    program
        .command('build')
        .description('Builds binaries for all supported platforms and resources.neu file')
        .option('-r, --release')
        .option('--embed-resources', 'Embed resources in the binary')
        .option('--config-file <path>', 'Specify the *.config.json file')
        .option('--copy-storage')
        .option('--clean')
        .option('--macos-bundle')
        .action(async (command) => {
            // Use custom config file if provided
            if (command.configFile) {
                utils.log(`Using config file: ${command.configFile}`);
                constants.files.configFile = command.configFile;
            }

            utils.checkCurrentProject();

            if (frontendlib.containsFrontendLibApp()) {
    utils.log('Running frontend build...');
    const proc = frontendlib.runCommand('buildCommand');

    if (proc) {
        await new Promise((resolve, reject) => {
            proc.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`Frontend build exited with code ${code}`)));
            proc.on('error', reject);
        });
        utils.log('Frontend build finished.');
    }

    // Prevent bundler from running frontend build
    frontendlib.runCommand = () => null;
}


            // Get distribution path
            const configObj = config.get();
            const buildDir = configObj.cli.distributionPath ? utils.trimPath(configObj.cli.distributionPath) : 'dist';

            if (command.clean) {
                utils.log(`Cleaning previous build files from ${buildDir}...`);
                utils.clearDirectory(buildDir);
            }

            utils.log('Bundling app...');
            await bundler.bundleApp({
                release: command.release,
                embedResources: command.embedResources,
                copyStorage: command.copyStorage,
                macosBundle: command.macosBundle
            });

            utils.showArt();
            utils.log(`Application package was generated at the ${buildDir} directory!`);
            utils.log('Distribution guide: https://neutralino.js.org/docs/distribution/overview');
        });
}
