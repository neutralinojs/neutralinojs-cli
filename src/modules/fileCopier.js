const fs = require('fs');
const path = require('path');
const config = require('./config');
const utils = require('../utils');

async function copyFile(src, dest) {
    try{
        fs.promises.copyFile(src, dest);
        src = utils.trimPath(src);
        utils.log(`Copied ${path.basename(src)} to dist folder`);
    }catch(err){
        utils.log(`Failed to copy ${src}:`);
        utils.error(err);
    }
}

module.exports.copier = async () => {
    const projectPath = process.cwd();
    const destFolder = path.join(projectPath, 'dist');
    const configObj = config.get();
    
    if(configObj.cli.copyFiles && Array.isArray(configObj.cli.copyFiles)){
        for(let file of configObj.cli.copyFiles){
            const src = path.join(projectPath, file);
            const dest = path.join(destFolder, path.basename(file));

            if(fs.existsSync(src)){
                await copyFile(src, dest);
            }else{
                utils.log(`Warning: ${file} not found, skipping...`);
            }
        }
    }
}