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
                    if(stderr) {
                        done(stderr);
                    }
                    assert.equal(error, null);
                    assert.equal(stderr, '');
                    assert.ok(typeof stdout == 'string');
                    assert.ok(stdout.includes('Usage: neu [options] [command]'));
                    assert.ok(stdout.includes(''));
                    done();
                }
            }).on('exit', (status) => { assert.strictEqual(status, 0); });
        });
    });
});
