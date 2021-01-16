const fs = require('fs');
const devServer = require('./devserver');
const APP_PATH = 'app';

let watcher = null;

module.exports.start = () => {
    if(!fs.existsSync(APP_PATH))
        return;
    watcher = fs.watch(APP_PATH, { interval: 100 },
        (event) => {
            if(event == 'change') {
                devServer.setData({
                    needsReload: true
                });
            }

        });
    devServer.start();
}

module.exports.stop = () => {
    if(watcher)
        watcher.close();
}