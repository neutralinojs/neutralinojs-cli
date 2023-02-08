const assert = require('assert');
const runner = require('./runner');

describe('Run neu update command and its options', () => {
    before(() => {
        runner.run('neu create test-app');
        process.chdir('test-app');
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
        it('updates binaries of neutralinojs project to specified version', async() => {
            runner.updateVersions('4.6.0', '3.5.0');
            let output = runner.run('neu update && neu version');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('neu: INFO Run "neu version" to see installed version details.') &&
            output.data.includes('Neutralinojs binaries: v4.6.0') &&
            output.data.includes('Neutralinojs client: v3.5.0'));
        });
    });
    describe('Test nightly update binaries of neutralinojs project', () => {
        it('updates binaries of neutralinojs project', async() => {
            runner.updateVersions('nightly', 'nightly');
            let output = runner.run('neu update && neu version');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('neu: INFO Run "neu version" to see installed version details.') &&
            output.data.includes('Neutralinojs binaries: nightly') &&
            output.data.includes('Neutralinojs client: nightly'));
        });
    });
    after(() => {
        process.chdir('..');
        runner.cleanup();
    });
});
