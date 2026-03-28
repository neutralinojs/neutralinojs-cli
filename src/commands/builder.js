module.exports.register = (program) => {
    program
        .command('builder <target>')
        .description('Build installer for given target')
        .action((target) => {

            const validTargets = ['nsis', 'deb', 'appimage'];

            if (!validTargets.includes(target)) {
                console.log("Invalid target: " + target);
                console.log("Supported: " + validTargets.join(', '));
                return;
            }

            console.log("Building for " + target);
        });
};