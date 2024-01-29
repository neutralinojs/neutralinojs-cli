const fs = require('fs');
const WS = require('websocket').w3cwebsocket;
const { v4: uuidv4 } = require('uuid');
const constants = require('../constants');
const frontendlib = require('./frontendlib');
const utils = require('../utils');

let ws = null;
let authInfo = null;
let reconnecting = false;
let retryHandler = null;

module.exports.start = (options = {}) => {
    authInfo = getAuthInfo();

    if(!authInfo) {
        retryLater(options);
        return;
    }

    ws = new WS(`ws://127.0.0.1:${authInfo.nlPort}?extensionId=js.neutralino.devtools
                    &connectToken=${authInfo.nlConnectToken}`);

    ws.onerror = () => {
        retryLater(options);
    };

    ws.onopen = () => {
        utils.log('neu CLI connected with the application.');
        if(options.frontendLibDev) {
            frontendlib.bootstrap(authInfo.nlPort);
        }
    };

    ws.onclose = () => {
        if(options.frontendLibDev) {
            frontendlib.cleanup();
        }
    }
}

module.exports.stop = () => {
    if(retryHandler) {
         clearTimeout(retryHandler);
    }
    if(ws) {
        ws.close();
        if(fs.existsSync(constants.files.authFile)) {
            fs.unlinkSync(constants.files.authFile);
        }
    }
}

module.exports.dispatch = (event, data) => {
    if(!ws || reconnecting) {
        return;
    }
    try {
        ws.send(JSON.stringify({
            id: uuidv4(),
            method: 'app.broadcast',
            accessToken: authInfo.nlToken,
            data: {
                event,
                data
            }
        }));
    }
    catch(err) {
        utils.error('Unable to dispatch event to the app.');
    }
}

function getAuthInfo() {
    let authInfo = null;
    try {
        authInfo = fs.readFileSync(constants.files.authFile, 'utf8');
        authInfo = JSON.parse(authInfo);
    }
    catch(err) {
        // ignore
    }
    return authInfo;
}

function retryLater(options) {
    reconnecting = true;
    retryHandler = setTimeout(() => {
        reconnecting = false;
        module.exports.start(options);
    }, 1000);
}
