const assert = require('assert');
const runner = require('./runner');

describe('Run neu help command', () => {
    before(() => {
        runner.run('neu create test-app');
        process.chdir('test-app');
    });
    describe('Test neu --help command', () => {
        it('returns output of neu --help', async() => {
            let output = runner.run('neu --help');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('Usage: neu [options] [command]'));
        });
    });
    after(() => {
        process.chdir('..');
        runner.cleanup();
    });
});