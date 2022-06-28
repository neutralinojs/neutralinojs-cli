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
        run('rm -rf test*');
        run('rm -rf .storage');
    }
    catch(err) {
        // ignore
    }
}

function readDirectory(Directory) {
    const files = [];
    try{
        fs.readdirSync(Directory).forEach(file => {
            files.push(file);
        });
    }
    catch(err) {
        // ignore
    }

    return files;
}

module.exports = {
    cleanup,
    readDirectory,
    run
}
