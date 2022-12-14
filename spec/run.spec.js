const assert = require('assert');
const runner = require('./runner');

describe('Run neu run command and its options', () => {
    describe('Test neu run --help command', () => {
        it('returns output of neu run --help', async() => {
            let output = runner.run('neu run --help');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('Usage: neu run [options]'));
        });
    });
});
