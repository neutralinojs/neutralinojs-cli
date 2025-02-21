const fse = require('fs-extra');
const fs = require('fs');
const zl = require('zip-lib');
const asar = require('@electron/asar');
const config = require('./config');
const constants = require('../constants');
const frontendlib = require('./frontendlib');
const hostproject = require('./hostproject');
const utils = require('../utils');
const {patchWindowsExecutable} = require('./exepatch');
const path = require('path');

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
    await fse.copy(`./${resourcesDir}`, `.tmp/${resourcesDir}`, {
        overwrite: true,
        filter: configObj.cli.resourcesExclude
            && ((src) =>
                (!new RegExp(configObj.cli.resourcesExclude).test(src))
            )
    });

    if (extensionsDir && fs.existsSync(extensionsDir)) {
        await fse.copy(`./${extensionsDir}`, `${buildDir}/${binaryName}/${extensionsDir}`, {
            overwrite: true,
            filter: configObj.cli.extensionsExclude
                && ((src) =>
                    (!new RegExp(configObj.cli.extensionsExclude).test(src))
                )
        });
    }

    await fse.copy(`${constants.files.configFile}`, `.tmp/neutralino.config.json`, { overwrite: true });
    
    if (clientLibrary) {
        let typesFile = clientLibrary.replace(/.js$/, '.d.ts');
        await fse.copy(`./${clientLibrary}`, `.tmp/${clientLibrary}`, { overwrite: true });
        if (fs.existsSync(`.tmp/${typesFile}`)) {
            fse.removeSync(`.tmp/${typesFile}`);
        }
    }

    if(icon) {
        await fse.copy(`./${icon}`, `.tmp/${icon}`, {overwrite: true});
    }

    let resourceFile = constants.files.resourceFile;
    if(hostproject.hasHostProject()) {
        resourceFile = `bin/${resourceFile}`;
    }
    await asar.createPackage('.tmp', `${buildDir}/${binaryName}/${resourceFile}`);
}

module.exports.bundleApp = async (options = {}) => {
    let configObj = config.get();
    let binaryName = configObj.cli.binaryName;
    const buildDir = configObj.cli.distributionPath ? utils.trimPath(configObj.cli.distributionPath) : 'dist';
    const hostProjectConfig = configObj.cli ? configObj.cli.hostProject : undefined;

    try {
        if (frontendlib.containsFrontendLibApp()) {
            await frontendlib.runCommand('buildCommand');
        }

        if(hostproject.hasHostProject()) {
            await hostproject.runCommand('buildCommand');
        }

        await createAsarFile();
        utils.log('Copying binaries...');

        for (let platform in constants.files.binaries) {
            for (let arch in constants.files.binaries[platform]) {
                let originalBinaryFile = constants.files.binaries[platform][arch];
                let destinationBinaryFile = hostproject.hasHostProject() ? `bin/${originalBinaryFile}` : originalBinaryFile.replace('neutralino', binaryName);
                if (fse.existsSync(`bin/${originalBinaryFile}`)) {
                    fse.copySync(`bin/${originalBinaryFile}`, `${buildDir}/${binaryName}/${destinationBinaryFile}`);
                }
            }
        }

        utils.log('Patching windows executables...');
        try {
            await Promise.all(Object.keys(constants.files.binaries.win32).map(async (arch) => {
                const origBinaryName = constants.files.binaries.win32[arch];
                const filepath = hostproject.hasHostProject() ? `bin/${origBinaryName}` : origBinaryName.replace('neutralino', binaryName);
                const winPath = `${buildDir}/${binaryName}/${filepath}`;
                if (await fse.exists(winPath)) {
                    await patchWindowsExecutable(winPath);
                }
            }))
        }
        catch (err) {
            console.error(err);
            utils.error('Could not patch windows executable');
            process.exit(1);
        }

        for (let dependency of constants.files.dependencies) {
            fse.copySync(`bin/${dependency}`, `${buildDir}/${binaryName}/${dependency}`);
        }

        if (options.copyStorage) {
            utils.log('Copying storage data...');
            try {
                fse.copySync('.storage', `${buildDir}/${binaryName}/.storage`);
            }
            catch (err) {
                utils.error('Unable to copy storage data from the .storage directory. Please check if the directory exists');
                process.exit(1);
            }
        }

        if(hostproject.hasHostProject() && hostProjectConfig && hostProjectConfig.buildPath){
            utils.log('Copying host project files...');
            fse.copySync(utils.trimPath(hostProjectConfig.buildPath), `${buildDir}/${binaryName}/`);
        }


        if(configObj.cli.copyItems && Array.isArray(configObj.cli.copyItems)){
            utils.log('Copying additional app package items...');
            for(let item of configObj.cli.copyItems){
                await fse.copy(`./${item}`, `${buildDir}/${binaryName}/${item}`);
            }
        }

        if(options.macosBundle){
            utils.log('Creating MacOS app bundles...');
            for(let macBinary of Object.values(constants.files.binaries.darwin)) {
                macBinary = hostproject.hasHostProject() ? `bin/${macBinary}` : macBinary.replace('neutralino', binaryName);
                fs.renameSync(`${buildDir}/${binaryName}/${macBinary}`, `${buildDir}/${binaryName}/${macBinary}.app`);
            }
        }

        if (options.release) {
            utils.log('Making app bundle ZIP file...');
            await zl.archiveFolder(`${buildDir}/${binaryName}`, `${buildDir}/${binaryName}-release.zip`);
        }
      
        utils.clearDirectory('.tmp');
    }
    catch (e) {
        utils.error(e);
    }
}
