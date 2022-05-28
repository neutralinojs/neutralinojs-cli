const assert = require('assert');
const { exec, execSync } = require("child_process");

describe('Run misc neu commands', () => {
    describe('Test neu --help command', () => {
        it('returns output of neu --help', (done) => {
            exec("neu --help", (error, stdout, stderr) => {
                if(error) {
                    done(error);
                }
                else {
                    console.log(stdout);
                    // assert output | Check for any possible tests
                    done();
                }
            });
        });
    });
});
