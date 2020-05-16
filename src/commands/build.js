const { exec } = require('child_process');
const commons = require('../commons');

module.exports.register = (program) => {
    program
        .command('build')
        .action((name, command) => {
            
            exec('npm run build', (err, stdout, stderr) => {
                if (err) {
                    console.error(stderr);
                    return;
                }
                else {
                    console.log('App build was successful!');
                    commons.figlet();
                }
              });
            
            
        });
}

