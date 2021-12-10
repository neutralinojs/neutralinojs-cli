const fs = require('fs');
const WS = require('websocket').w3cwebsocket;
const { v4: uuidv4 } = require('uuid');
const constants = require('../constants');

let ws = null;
let authInfo = null;
let reconnecting = false;
let retryHandler = null;

module.exports.start = () => {
    authInfo = getAuthInfo();

    if(!authInfo) {
        retryLater();
        return;
    }

    ws = new WS(`ws://localhost:${authInfo.port}`);

    ws.onerror = () => {
        retryLater();
    };

    ws.onopen = () => {
        console.log('neu CLI connected with the application.');
    };
}

module.exports.stop = () => {
    if(ws) {
        clearTimeout(retryHandler);
        ws.close();
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
            accessToken: authInfo.accessToken,
            data: {
                event,
                data
            }
        }));
    }
    catch(err) {
        console.log(`${chalk.bgRed.white('ERROR')} Unable to dispatch event to the app.`);
    }
}

function getAuthInfo() {
    let authInfo = null;
    try {
        authInfo = fs.readFileSync('.tmp/auth_info.json', 'utf8');
        authInfo = JSON.parse(authInfo);
    }
    catch(err) {
        // ignore
        console.log(err);
    }
    return authInfo;
}

function retryLater() {
    reconnecting = true;
    retryHandler = setTimeout(() => {
        reconnecting = false;
        module.exports.start();
    }, 5000);
}
