const fs = require('fs');
const chokidar = require('chokidar');
const devServer = require('./devserver');
const APP_PATH = 'app';

let watcher = null;

module.exports.start = () => {
    if(!fs.existsSync(APP_PATH))
        return;
    watcher = chokidar.watch(APP_PATH , {ignoreInitial: true}).on('all', () => {
        devServer.setData({
            needsReload: true
        });
    });
    devServer.start();
}

module.exports.stop = () => {
    if(watcher)
        watcher.close();
}