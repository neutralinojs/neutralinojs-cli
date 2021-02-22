const fs = require('fs');
const chokidar = require('chokidar');
const devServer = require('./devserver');
const bundler = require('../modules/bundler');
const APP_PATH = 'app';
const APP_SOURCE_PATH = 'src';

let watcher = null;
let appSourceWatcher = null;
let isBuilding = false;

module.exports.start = (autoBuild = false) => {
    startAppWatcher();
    devServer.start();
    if(autoBuild)
        startSourceWatcher();
}

module.exports.stop = () => {
    if(watcher)
        watcher.close();
    if(appSourceWatcher)
        appSourceWatcher.close();
    devServer.stop();
}


function startAppWatcher() {
    if(!fs.existsSync(APP_PATH))
        return;
    watcher = chokidar.watch(APP_PATH , {ignoreInitial: true}).on('all', () => {
        devServer.setData({
            needsReload: true
        });
    });
}

function startSourceWatcher() {
    if(!fs.existsSync(APP_SOURCE_PATH))
        return;
    appSourceWatcher = chokidar.watch(APP_SOURCE_PATH , {ignoreInitial: true}).on('all', () => {
        if(isBuilding) {
            console.log("Please wait for the current build job completion");
            return;
        }
        console.log(`${new Date().toLocaleTimeString()}: Building app source for the latest changes...`);
        isBuilding = true;
        bundler.buildApp(() => {
            console.log(`${new Date().toLocaleTimeString()}: Automatic build done. your app will be reloaded soon.`);
            isBuilding = false;
        }, false);
    });
}
