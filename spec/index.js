const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');
const runner = require('./runner');

let mocha = new Mocha();
let testDir = '.';
let specModule = process.argv.length > 2 ? process.argv[2] : '';

runner.backupGitignore();

fs.readdirSync(testDir).filter((file) => file.includes(specModule + '.spec.js'))
.forEach((file) => {
    mocha.addFile(path.join(testDir, file));
});
mocha.timeout(50000);
mocha.run((failures) => {
		runner.restoreGitignore();
    runner.cleanup();

    process.exitCode = failures ? 1 : 0;
});
