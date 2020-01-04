const contants = require('../contants');
var clone = require('git-clone');

module.exports.register = (program) => {
    program
        .command('create <name>')
        .option('-t, --template [templatename]')
        .action((name, command) => {
            if(command.template in contants.templates) {
                let template = contants.templates[command.template];
                clone(template.githubUrl, `./${name}`, {}, () => {
                    console.log('Neutralino!');
                });
                console.log(`Creating project ${name}...`);
            }
            else {
                console.log('Unable to find template');
            }
            
            
        });
}

