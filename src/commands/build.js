const contants = require('../contants');
const { exec } = require('child_process');
const commons = require('../commons');

module.exports.register = (program) => {
    program
        .command('build')
        .action((name, command) => {
            
            exec('npm run build', (err, stdout, stderr) => {
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
}

