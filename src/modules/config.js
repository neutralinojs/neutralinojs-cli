const editJsonFile = require('edit-json-file');
const constants = require('../constants');
const CONFIG_FILE = constants.files.configFile;

module.exports.update = (key, value) => {
    let file = editJsonFile(CONFIG_FILE);
    file.set(key, value);
    file.save();
};

module.exports.get = () => {
    let file = editJsonFile(CONFIG_FILE);
    return file.get();
};
