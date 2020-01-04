const contants = require('../contants');
var clone = require('git-clone');
const commons = require('../commons');
const { exec } = require('child_process');

module.exports.register = (program) => {
    program
        .command('create <name>')
        .option('-t, --template [templatename]')
        .action((name, command) => {
            if(command.template in contants.templates) {
                let template = contants.templates[command.template];
                clone(template.githubUrl, `./${name}`, {}, () => {
                    exec(`npm i --prefix ${name}`, (err, stdout, stderr) => {
                        console.log(stdout);
                        if (err) {
                            console.error(stderr);
                            return;
                        }
                        else {
                            commons.figlet();
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

