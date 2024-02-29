const fs = require('fs');
const chokidar = require('chokidar');
const websocket = require('./websocket');
const config = require('../modules/config');
const utils = require('../utils');

let fileWatcher = null;

module.exports.start = () => {
    startFileWatcher();
}

module.exports.stop = () => {
    if(fileWatcher)
        fileWatcher.close();
}

function startFileWatcher() {
    let configObj = config.get();
    let resourcesDir = utils.trimPath(configObj.cli.resourcesPath);
    if(!fs.existsSync(resourcesDir))
        return;
    let exclude = [
        '(^|[\\/\\\\])\\..', // dot files
        'node_modules.*',
        '^bin.*',
        '.*.log$'
    ];

    if (configObj && configObj.cli && configObj.cli.autoReloadExclude) {
        exclude.push(configObj.cli.autoReloadExclude);
    }
    let watcherOptions = {
        ignoreInitial: true,
        ignored: new RegExp(exclude.join('|'))
    };

    fileWatcher = chokidar.watch(resourcesDir, watcherOptions)
        .on('all', (event, path) => {
            if(['unlink', 'unlinkDir'].includes(event))
                return;

            websocket.dispatch('neuDev_reloadApp');
        });
}
