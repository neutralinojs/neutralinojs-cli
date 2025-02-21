const editJsonFile = require('edit-json-file');
const constants = require('../constants');
const getConfigFile = () => constants.files.configFile;

module.exports.update = (key, value) => {
    let file = editJsonFile(getConfigFile());
    file.set(key, value);
    file.save();
};

module.exports.get = () => {
    let file = editJsonFile(getConfigFile());
    return file.get();
};
