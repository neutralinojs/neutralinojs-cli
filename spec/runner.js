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
        fs.rmSync('./test-app',{ recursive: true});
        fs.rmSync('./test-template-app',{ recursive: true});
    }
    catch(err) {
        // ignore
    }
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
    run
}
