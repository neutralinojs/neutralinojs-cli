const assert = require('assert');
const runner = require('./runner')

describe('Run misc neu commands', () => {
    describe('Test neu --help command', () => {
        it('returns output of neu --help', async() => {
            let output = runner.run("neu --help");

            assert.equal(output.status, null);
            assert.ok(typeof output == 'string');
            assert.ok(output.includes('Usage: neu [options] [command]'));
            assert.ok(output.includes(''));
        });
    });
});
