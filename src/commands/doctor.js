const utils = require('../utils');
const doctor = require('../modules/doctor')

module.exports.register = (program) => {
		program
				.command('doctor')
				.description('check if the development environment is healthy')
				.action(async () => {
						const isHealthy = await doctor.runDiagnostic();

            if (!isHealthy) {
								console.log('-------');
                utils.warn('Neutralino "Doctor" found some issues (see above).');
								process.exit(1)
            } else {
                utils.showArt();
                utils.log('Your environment looks great! Happy coding.');
            }
				});
}

