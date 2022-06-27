const assert = require('assert');
const runner = require('./runner')

describe('Run misc neu commands', () => {
    before(() => {
        runner.run('neu create test-app');
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
    describe('Test neu version command', () => {
        it('returns output of neu version --help', async() => {
            let output = runner.run('neu version --help');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('Usage: neu version [options]'));
        });
        it('returns neu version installed globally', async() => {
            let output = runner.run('neu version');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('Global') &&
            output.data.includes('neu CLI: v'));
        });
        it('returns project specific neu version details', async() => {
            let output = runner.run('cd test-app && neu version');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('Global') &&
                output.data.includes('neu CLI: v'));
            assert.ok(output.data.includes('Project') &&
                output.data.includes('Neutralinojs binaries') &&
                output.data.includes('Neutralinojs client') &&
                output.data.includes('Project version'));
        });
    });
    after(() => {
        runner.run('rm -r test*');
    });
});
