const assert = require('assert');
const runner = require('./runner');

describe('Run neu update command and its options', () => {
    before(() => {
        runner.run('neu create test-app');
    });
    describe('Test neu update --help command', () => {
        it('returns output of neu update --help', async() => {
            let output = runner.run('neu  update --help');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('Usage: neu update [options]'));
        });
    });
    describe('Test update binaries of neutralinojs project', () => {
        it('updates binaries of neutralinojs project', async() => {
            let output = runner.run('cd test-app && neu update');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('neu: INFO Run "neu version" to see installed version details.'));
        });
    });
    describe('Test nightly update binaries of neutralinojs project', () => {
        it('updates binaries of neutralinojs project', async() => {
            let output = runner.run('cd test-app && neu update nightly');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('neu: INFO Run "neu version" to see installed version details.'));
        });
    });
    after(() => {
        runner.cleanup();
    });
});
