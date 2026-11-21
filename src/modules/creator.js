const process = require('process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const fse = require('fs-extra');
const config = require('../modules/config');
const downloader = require('./downloader');
const frontendlib = require('../modules/frontendlib');
const hostproject = require('../modules/hostproject');
const utils = require('../utils');

function isOfficialTemplate(template) {
    if (!template || typeof template !== 'string') {
        return false;
    }
    // Reject null bytes, whitespace anywhere, and backslashes
    if (template.includes('\0') || /\s/.test(template) || template.includes('\\')) {
        return false;
    }
    if (fs.existsSync(template)) {
        return false;
    }
    const parts = template.split('/');
    if (parts.length !== 2) {
        return false;
    }
    const [owner, repo] = parts;
    if (owner.toLowerCase() !== 'neutralinojs') {
        return false;
    }
    // GitHub repository name: must only contain alphanumeric, hyphens, underscores, dots
    // and must not be '.' or '..' or contain path traversal '..'
    if (!/^[a-zA-Z0-9_.-]+$/.test(repo) || repo === '.' || repo === '..' || repo.includes('..')) {
        return false;
    }
    return true;
}

function promptConsent() {
    return new Promise((resolve) => {
        let answered = false;
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const closeAndResolve = (result) => {
            if (!answered) {
                answered = true;
                rl.close();
                resolve(result);
            }
        };

        rl.question('Do you want to run this command? (y/N) ', (answer) => {
            const normalized = answer ? answer.trim().toLowerCase() : '';
            closeAndResolve(normalized === 'y' || normalized === 'yes');
        });

        rl.on('close', () => {
            closeAndResolve(false);
        });

        rl.on('SIGINT', () => {
            closeAndResolve(false);
        });
    });
}

function printManualInstructions(workingDir, projectRoot, cmd) {
    utils.log('You can run it manually later:');
    if (workingDir && workingDir !== projectRoot) {
        const rel = path.relative(projectRoot, workingDir);
        utils.log(`  cd ${rel} && ${cmd}`);
    } else {
        utils.log(`  ${cmd}`);
    }
}

async function executeInitCommand(type, runCommandFn, template, options) {
    const configObj = config.get();
    const subConfig = configObj.cli ? configObj.cli[type] : undefined;
    if (!subConfig || !subConfig.initCommand || typeof subConfig.initCommand !== 'string') {
        return;
    }
    const cmd = subConfig.initCommand.trim();
    if (!cmd) {
        return;
    }

    const projectRoot = path.resolve(process.cwd());
    const validation = utils.validateProjectPath(subConfig.projectPath, projectRoot);
    if (!validation.valid) {
        utils.error(validation.error);
        return;
    }
    const workingDir = validation.targetDir;

    // Precedence rule: --no-init takes precedence over --run-init / --yes
    if (options.noInit) {
        utils.log(`Skipping template initialization command (--no-init specified): ${cmd}`);
        printManualInstructions(workingDir, projectRoot, cmd);
        return;
    }

    if (options.runInit) {
        await runCommandFn();
        return;
    }

    if (isOfficialTemplate(template)) {
        await runCommandFn();
        return;
    }

    const isInteractive = Boolean(process.stdin.isTTY && process.stdout.isTTY) || process.env.NEU_FORCE_TTY === 'true';

    if (!isInteractive) {
        utils.warn('The template defines the following initialization command:');
        utils.log(`  Command: ${cmd}`);
        utils.log(`  Directory: ${workingDir}`);
        utils.warn('Skipping initialization command because the environment is non-interactive.');
        utils.log('To run template initialization commands automatically, use --run-init or --yes.');
        printManualInstructions(workingDir, projectRoot, cmd);
        return;
    }

    // Interactive consent prompt
    utils.warn('The template defines the following initialization command:');
    utils.log(`  Command: ${cmd}`);
    utils.log(`  Directory: ${workingDir}`);
    utils.warn('This command comes from an untrusted template and will run with your privileges.');

    const consent = await promptConsent();
    if (consent) {
        await runCommandFn();
    } else {
        utils.log('Initialization command skipped.');
        printManualInstructions(workingDir, projectRoot, cmd);
    }
}

module.exports.createApp = async (appPath, template, options = {}) => {
    const origCwd = process.cwd();
    const binaryName = path.basename(path.resolve(appPath));

    if (utils.isNeutralinojsProject(appPath)) {
        utils.error(`${appPath} directory already contains a Neutralinojs project.`);
        process.exit(1);
    }

    if(!template) {
        template = 'neutralinojs/neutralinojs-minimal';
    }

    let parsedTemplate = template;
    const isLocalTemplate = fs.existsSync(template);
    let resolvedTemplate;

    if (isLocalTemplate) {
        resolvedTemplate = path.resolve(template);
        parsedTemplate = resolvedTemplate;
    } else if (isOfficialTemplate(template)) {
        const parts = template.split('/');
        parsedTemplate = `neutralinojs/${parts[1]}`;
        resolvedTemplate = parsedTemplate;
    } else {
        resolvedTemplate = template;
    }

    utils.log(`Checking if ${parsedTemplate} is a valid Neutralinojs app template...`);

    const isValidTemplate = await downloader.isValidTemplate(resolvedTemplate);
    if(!isValidTemplate) {
        utils.error(`${parsedTemplate} is not a valid Neutralinojs app template.`);
        process.exit(1);
    }

    utils.log(`Downloading ${parsedTemplate} template to ${binaryName} directory...`);

    fs.mkdirSync(appPath, { recursive: true });
    process.chdir(appPath); // Change the path context for the following methods

    try {
        await downloader.downloadTemplate(resolvedTemplate);
        if (!isLocalTemplate && !process.env.NEU_SKIP_DOWNLOAD) {
            await downloader.downloadAndUpdateBinaries();
            await downloader.downloadAndUpdateClient();
        }
    }
    catch(err) {
        process.chdir(origCwd);
        utils.error('Unable to download resources from internet.' +
                    ' Please check your internet connection and template URLs.');
        process.exit(1);
    }

    config.update('cli.binaryName', binaryName);
    config.update('modes.window.title', binaryName);

    if(frontendlib.containsFrontendLibApp()) {
        await executeInitCommand('frontendLibrary', () => frontendlib.runCommand('initCommand'), parsedTemplate, options);
    }

    if(hostproject.hasHostProject()) {
        await executeInitCommand('hostProject', () => hostproject.runCommand('initCommand'), parsedTemplate, options);
    }

    console.log('-------');
    utils.log(`Enter 'cd ${appPath} && neu run' to run your application.`);
    process.chdir(origCwd);
}

module.exports.isOfficialTemplate = isOfficialTemplate;
module.exports.executeInitCommand = executeInitCommand;
module.exports.promptConsent = promptConsent;
