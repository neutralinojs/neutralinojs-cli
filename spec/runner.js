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

function cleanup() {
    try {
        fs.rmdirSync('./test-app',{ recursive: true});
        fs.rmdirSync('./test-template-app',{ recursive: true});
    }
    catch(err) {
        // ignore
    }
}

function readDirectory(path) {
    let files = [];
    try {
        fs.readdirSync(path).forEach(file => {
            files.push(file);
        });
    }
    catch(err) {
        // ignore
    }

    return files;
}

function updateNightly(file) {
    const config = JSON.parse(fs.readFileSync(file));
    config['cli']['binaryVersion'] = 'nightly';
    config['cli']['clientVersion'] = 'nightly';
    fs.writeFileSync(file, JSON.stringify(config, null, 2));
}

module.exports = {
    cleanup,
    readDirectory,
    updateNightly,
    run
}
