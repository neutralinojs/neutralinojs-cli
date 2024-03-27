const fse = require('fs-extra');
const fs = require('fs');
const archiver = require('archiver');
const asar = require('@electron/asar');
const config = require('./config');
const constants = require('../constants');
const frontendlib = require('./frontendlib');
const utils = require('../utils');
const { glob } = require('glob')

async function createAsarFile() {
    utils.log(`Generating ${constants.files.resourceFile}...`);
    const configObj = config.get();
    const resourcesDir = utils.trimPath(configObj.cli.resourcesPath);
    const extensionsDir = utils.trimPath(configObj.cli.extensionsPath);
    const clientLibrary = configObj.cli.clientLibrary ? utils.trimPath(configObj.cli.clientLibrary)
        : null;
    const icon = utils.trimPath(configObj.modes.window.icon);
    const binaryName = configObj.cli.binaryName;
    const buildDir = configObj.cli.distributionPath ? utils.trimPath(configObj.cli.distributionPath) : 'dist';

    fs.mkdirSync(`.tmp`, { recursive: true });
    let resourceFiles = await glob("**", { cwd: resourcesDir, matchBase: true, nodir: true })
    if (configObj.cli.resourcesIgnore) {
        const resourcesIgnoreFiles = await glob(configObj.cli.resourcesIgnore, { cwd: resourcesDir, matchBase: true, nodir: true })
        resourceFiles = resourceFiles.filter(file => !resourcesIgnoreFiles.includes(file))
    }
    for (const file of resourceFiles) {
        console.log(file)
        await fse.copy(`./${resourcesDir}/${file}`, `.tmp/${resourcesDir}/${file}`, { overwrite: true });
    }

    if (extensionsDir && fs.existsSync(extensionsDir)) {
        let extensionsFiles = await glob("**", { cwd: extensionsDir, matchBase: true, nodir: true })
        if (configObj.cli.extensionsIgnore) {
            const extensionsIgnoreFiles = await glob(configObj.cli.extensionsIgnore, { cwd: extensionsDir, matchBase: true, nodir: true })
            extensionsFiles = extensionsFiles.filter(file => !extensionsIgnoreFiles.includes(file))
        }
        for (const file of extensionsFiles) {
            await fse.copy(`./${extensionsDir}/${file}`, `${buildDir}/${binaryName}/${extensionsDir}/${file}`, { overwrite: true });
        }
    }

    await fse.copy(`${constants.files.configFile}`, `.tmp/${constants.files.configFile}`, { overwrite: true });
    if (clientLibrary) {
        let typesFile = clientLibrary.replace(/.js$/, '.d.ts');
        await fse.copy(`./${clientLibrary}`, `.tmp/${clientLibrary}`, { overwrite: true });
        if (fs.existsSync(`.tmp/${typesFile}`)) {
            fse.removeSync(`.tmp/${typesFile}`);
        }
    }
    await fse.copy(`./${icon}`, `.tmp/${icon}`, { overwrite: true });

    await asar.createPackage('.tmp', `${buildDir}/${binaryName}/${constants.files.resourceFile}`);
}

module.exports.bundleApp = async (isRelease, copyStorage) => {
    let configObj = config.get();
    let binaryName = configObj.cli.binaryName;
    const buildDir = configObj.cli.distributionPath ? utils.trimPath(configObj.cli.distributionPath) : 'dist';

    try {
        if (frontendlib.containsFrontendLibApp()) {
            await frontendlib.runCommand('buildCommand');
        }

        await createAsarFile();
        utils.log('Copying binaries...');

        for (let platform in constants.files.binaries) {
            for (let arch in constants.files.binaries[platform]) {
                let originalBinaryFile = constants.files.binaries[platform][arch];
                let destinationBinaryFile = originalBinaryFile.replace('neutralino', binaryName);
                if (fse.existsSync(`bin/${originalBinaryFile}`)) {
                    fse.copySync(`bin/${originalBinaryFile}`, `${buildDir}/${binaryName}/${destinationBinaryFile}`);
                }
            }
        }

        for (let dependency of constants.files.dependencies) {
            fse.copySync(`bin/${dependency}`, `${buildDir}/${binaryName}/${dependency}`);
        }

        if (copyStorage) {
            utils.log('Copying storage data...');
            try {
                fse.copySync('.storage', `${buildDir}/${binaryName}/.storage`);
            }
            catch (err) {
                utils.error('Unable to copy storage data from the .storage directory. Please check if the directory exists');
                process.exit(1);
            }
        }

        if (isRelease) {
            utils.log('Making app bundle ZIP file...');
            let output = fs.createWriteStream(`${buildDir}/${binaryName}-release.zip`);
            let archive = archiver('zip', { zlib: { level: 9 } });
            archive.pipe(output);
            archive.directory(`${buildDir}/${binaryName}`, false);
            await archive.finalize();
        }
        utils.clearDirectory('.tmp');
    }
    catch (e) {
        utils.error(e);
    }
}
