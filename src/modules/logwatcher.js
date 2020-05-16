const fs = require('fs');
const chalk = require('chalk');
const LOG_FILE = 'neutralinojs.log';

let watcher = null;

let formalLine = (line) => {
    let matches = /^(WARN|INFO|ERROR|DEBUG) /.exec(line);
    if(matches && matches[1]) {
        let colorFormatter;
        switch(matches[1]) {
            case 'WARN':
                colorFormatter = chalk.bgYellow.black;
                break;
            case 'INFO':
                colorFormatter = chalk.bgGreen.black;
                break;
            case 'ERROR':
                colorFormatter = chalk.bgRed.white;
                break;
            case 'DEBUG':
                colorFormatter = chalk.bgWhite.black;
                break;
        }
        line = line.replace(new RegExp(`^${matches[1]} `), `${colorFormatter(matches[1])} `);
    }
    return line;
}

module.exports.start = () => {
    if(!fs.existsSync(LOG_FILE))
        fs.closeSync(fs.openSync(LOG_FILE, 'w'));
    watcher = fs.watch(LOG_FILE,{interval: 100},
    (event) => {
        if(event == 'change') {
            let content = fs.readFileSync(LOG_FILE).toString().split('\n');
            let line = content[content.length - 2];
            console.log(formalLine(line));
        }

    });
}

module.exports.stop = () => {
    if(watcher)
        watcher.close();
}