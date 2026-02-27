const utils = require('../utils');
const bundler = require('../modules/bundler');
const config = require('../modules/config');
const constants = require('../constants');
const path = require('path');

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
        .action(async (command) => {
    if (command.configFile) {
        utils.log(`Using config file: ${command.configFile}`);
        constants.files.configFile = command.configFile;
    }

    utils.checkCurrentProject();

    const configObj = config.get();
    const projectRoot = process.cwd();

    let buildDir = 'dist';
    if (configObj.cli && typeof configObj.cli.distributionPath === 'string') {
        buildDir = utils.trimPath(configObj.cli.distributionPath);
    }

    if (typeof buildDir !== 'string' || buildDir.trim() === '') {
        throw new Error('Invalid distributionPath: must be a non-empty string.');
    }

    const absoluteBuildDir = path.resolve(projectRoot, buildDir);

    // Prevent using project root as build directory
    if (absoluteBuildDir === projectRoot) {
        throw new Error(
            `Invalid distributionPath: "${buildDir}". It cannot be the project root.`
        );
    }

    // Prevent paths outside the project directory
    const relativePath = path.relative(projectRoot, absoluteBuildDir);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        throw new Error(
            `Invalid distributionPath: "${buildDir}". It must be inside the project folder.`
        );
    }

    if (command.clean) {
        utils.log(`Cleaning previous build files from ${buildDir}...`);
        utils.clearDirectory(absoluteBuildDir);
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