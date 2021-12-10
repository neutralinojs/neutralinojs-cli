const fs = require('fs');
const chokidar = require('chokidar');
const websocket = require('./websocket');
const bundler = require('../modules/bundler');
const APP_PATH = '.';

let fileWatcher = null;

module.exports.start = () => {
    startFileWatcher();
}

module.exports.stop = () => {
    if(fileWatcher)
        fileWatcher.close();
}

function startFileWatcher() {
    if(!fs.existsSync(APP_PATH))
        return;
    let watcherOptions = {
        ignoreInitial: true,
        ignored: /(^|[\/\\])\..|node_modules|bin|(.*.log)/
    };
    fileWatcher = chokidar.watch(APP_PATH, watcherOptions)
        .on('all', (event, path) => {
            if(['unlink', 'unlinkDir'].includes(event))
                return;

            websocket.dispatch('devEvent_reloadApp');
        });
}
