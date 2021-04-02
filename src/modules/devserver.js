const express = require('express');
const cors = require('cors');
const DEV_APP_PORT = 5050;

let devAPIServer = null;
let devAPIData = {
    needsReload: false,
    success: true
};

module.exports.start = () => {
    const devAPI = express();
    devAPI.use(cors());
    devAPI.get('/', (req, res) => {
        res.json(devAPIData);
        devAPIData.needsReload = false;
    })

    devAPIServer = devAPI.listen(DEV_APP_PORT, () => {
        console.log(`devAPIServer listening at http://localhost:${DEV_APP_PORT}`);
    })
}

module.exports.stop = () => {
    if(devAPIServer)
        devAPIServer.close();
}

module.exports.setData = (options) => {
    Object.assign(devAPIData, options);
}
