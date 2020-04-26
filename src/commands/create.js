const { exec } = require('child_process');
const fs = require('fs');
const contants = require('../contants');
const  clone = require('git-clone');
const commons = require('../commons');
const settings = require('../modules/settings');


module.exports.register = (program) => {
    program
        .command('create <name>')
        .option('-t, --template [templatename]')
        .action((name, command) => {
            if(command.template in contants.templates) {
                let template = contants.templates[command.template];
                clone(template.githubUrl, `./${name}`, {}, () => {
                    exec(`cd ${name} && npm i`, (err, stdout, stderr) => {
                        if (err) {
                            console.error(stderr);
                            return;
                        }
                        else {
                            fs.renameSync(`${name}/neutralino-win.exe`, `${name}/${name}-win.exe`);
                            fs.renameSync(`${name}/neutralino-linux`, `${name}/${name}-linux`);
                            fs.renameSync(`${name}/neutralino-mac`, `${name}/${name}-mac`);
                            settings.update('appname', name, name);
                            commons.figlet();
                            console.log(`Enter 'cd ${name} && neu build' to build the app.`);
                        }
                      });
                });
                console.log(`Creating project ${name}...`);
            }
            else {
                console.log('Unable to find template');
            }
            
            
        });
}

