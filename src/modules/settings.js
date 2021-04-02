const editJsonFile = require('edit-json-file');
const CONFIG_FILE = 'neutralino.config.json';

module.exports.update = (key, value, appName) => {
    let file;
    if(appName)
        file = editJsonFile(`${appName}/${CONFIG_FILE}`);
    else
        file = editJsonFile(CONFIG_FILE);
    file.set(key, value);
    file.save();
};

module.exports.get = (path = "") => {
    let file = editJsonFile(path + CONFIG_FILE);
    return file.get();
};
