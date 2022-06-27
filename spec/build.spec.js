const assert = require('assert');
const runner = require('./runner')

describe('Run neu build command and its options', () => {
    describe('Test neu build --help command', () => {
        it('returns output of neu build --help', async() => {
            let output = runner.run('neu build --help');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('Usage: neu build [options]'));
        });
    });
});
