const editJsonFile = require('edit-json-file');
const constants = require('../constants');

const getConfigFile = () => {
    let argIndex = process.argv.indexOf('--config-file');
    if (argIndex !== -1 && process.argv[argIndex + 1]) {
        return process.argv[argIndex + 1];
    }
    return constants.files.configFile;
};

module.exports.update = (key, value) => {
    let file = editJsonFile(getConfigFile());
    file.set(key, value);
    file.save();
};

module.exports.get = () => {
    let file = editJsonFile(getConfigFile());
    return file.get();
};
