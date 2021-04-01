const editJsonFile = require('edit-json-file');
const SETTINGS_FILE = 'neutralino.config.json';

module.exports.update = (key, value, appName) => {
    let file;
    if(appName)
        file = editJsonFile(`${appName}/${SETTINGS_FILE}`);
    else
        file = editJsonFile(SETTINGS_FILE);
    file.set(key, value);
    file.save();
};

module.exports.get = () => {
    let file = editJsonFile(SETTINGS_FILE);
    return file.get();
};
