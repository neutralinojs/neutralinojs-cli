const fs = require('fs');
const path = require('path');
const process = require('process');
const utils = require('../utils');
const constants = require('../constants');
const config = require('./config');

let hasError = false;

function checkClientNodeVersion() {
		const clientNodeVersion = parseInt(
			process.version
				.slice(1)
				.split('.')
				[0]
		);

		if(clientNodeVersion < 16) {
				utils.warn(`Node.js v16+ is required for stable performance. Current version: ${process.version}`);
				hasError = true
				return;
		}

		utils.log(`Node.js ${process.version} is compatible.`);
}

function checkBinaries() {
		const platform = process.platform;
		const arch = process.arch;

		const binaryName = constants.files.binaries[platform] ? constants.files.binaries[platform][arch] : null;

		const binPath = path.join(process.cwd(), 'bin');

		if(!fs.existsSync(binPath)) {
				utils.warn('Folder "bin" is missing. Please run "neu update".');
				hasError = true
				return;
		}

		if (binaryName) {
        const fullBinaryPath = path.join(binPath, binaryName);
        if (!fs.existsSync(fullBinaryPath)) {
            utils.error(`Binary for your system (${binaryName}) is missing in "bin" folder. Run "neu update".`);
		        hasError = true
				} else {
            utils.log(`Binary for ${platform}-${arch}: OK`);
        }
    } else {
        const files = fs.readdirSync(binPath);
        if (files.length === 0) {
            utils.error('Folder "bin" is empty. Run "neu update".');
		        hasError = true
				} else {
            utils.log('Binaries: OK (generic)');
        }
    }
}

function checkResources() {
    const configObj = config.get();
    const resPathName = utils.trimPath(configObj.resourcesPath || '/res');
    const resPath = path.join(process.cwd(), resPathName);

    if (!fs.existsSync(resPath)) {
        utils.error(`Resources folder "${resPathName}" not found. Please check "resourcesPath" in your config.`);
        hasError = true
				return;
    }

    const indexPath = path.join(resPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
        utils.warn(`Main entry file "index.html" not found in "${resPathName}". Application might not start correctly.`);
    } else {
        utils.log(`Resources (${resPathName}): OK`);
    }
}

module.exports.runDiagnostic = async () => {
		hasError = false;

		utils.log('Diagnostic...');

		if (!utils.isNeutralinojsProject()) {
        utils.error(`Unable to find neutralino.config.json. Please check whether the current directory has a Neutralinojs project.`);
        return false;
    }

		checkClientNodeVersion();

		const isLatestCLI = await utils.checkLatestVersion();
    if (!isLatestCLI) {
				hasError = true;
		}

		checkBinaries();
		checkResources();

		utils.log('Diagnostic completed');
		return !hasError
}