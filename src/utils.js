const fs = require('fs');
const config = require('./modules/config');

module.exports.patchForHotReload = () => {
    let configObj = config.get();
    let patchFile = configObj.cli.hotReloadPatchFile.replace(/^\//, '');
    let html = fs.readFileSync(patchFile, 'utf8');
    console.log(html);
}

function revertHotReloadPatch() {

}
