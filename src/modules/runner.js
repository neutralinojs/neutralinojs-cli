const { exec } = require('child_process');
const fs = require('fs');
const EXEC_PERMISSION = 755;

module.exports.runApp = async (argsOpt = null) => {
    return new Promise((resolve, reject) => {
        let binaryPath;
        let args = " --load-dir-res --path=.";
        if(argsOpt)
            args += " " + argsOpt;
    
        switch (process.platform) {
            case 'win32':
                binaryPath = 'bin\\neutralino-win.exe';
                break;
            case 'linux':
                binaryPath = 'bin/neutralino-linux';
                fs.chmodSync(binaryPath, EXEC_PERMISSION);
                break;
            case 'darwin':
                binaryPath = 'bin/neutralino-mac';
                fs.chmodSync(binaryPath, EXEC_PERMISSION);
                break;
        }
        exec(binaryPath + args, (err, stdout, stderr) => {
            if (err) {
                reject(stderr);
            }
            else {
                resolve();
            }
        });
    });
}
