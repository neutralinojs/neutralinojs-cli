const { execSync } = require('child_process');
const fs = require('fs');

function run(command) {
    let output = null;
    let err = null;
    let statusCode = 0;

    try {
        output = execSync(command);
    }
    catch(error) {
        statusCode = error.status;
        err = error;
    }
    finally {
        return {
            error: decodeUTF8(err),
            data : decodeUTF8(output),
            status : statusCode
        };
    }
}

function decodeUTF8(decode) {
    return decode ? decode.toString('utf8') : null;
}

let gitignoreBackup = null;

function backupGitignore() {
    if (fs.existsSync('.gitignore')) {
        gitignoreBackup = fs.readFileSync('.gitignore');
    }
}

function restoreGitignore() {
    if (gitignoreBackup) {
        fs.writeFileSync('.gitignore', gitignoreBackup);
        gitignoreBackup = null;
    } else if (fs.existsSync('.gitignore')) {
        fs.unlinkSync('.gitignore');
    }
}

function cleanup() {
    const targets = [
        './test-app',
        './test-template-app',
        './empty-dir',
        './neutralino.config.json',
        './res',
				'./resources',
        './README.md',
        './LICENSE',
        './.github',
        './bin',
        './dist',
        './storage',
        './auth_info.json'
    ];

    targets.forEach(target => {
        try {
            if (fs.existsSync(target)) {
                fs.rmSync(target, { recursive: true, force: true });
            }
        } catch(err) {
            // ignore
        }
    });
}

function updateVersions(binaryVersion, clientVersion) {
    const file = 'neutralino.config.json';
    const config = JSON.parse(fs.readFileSync(file));

    config['cli']['binaryVersion'] = binaryVersion;
    config['cli']['clientVersion'] = clientVersion;
    fs.writeFileSync(file, JSON.stringify(config, null, 2));
}

module.exports = {
    cleanup,
    updateVersions,
    run,
		backupGitignore,
    restoreGitignore
}
