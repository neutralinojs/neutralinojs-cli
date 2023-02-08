const assert = require('assert');
const runner = require('./runner');

describe('Run neu plugins command and its options', () => {
    describe('Test neu plugins --help command', () => {
        it('returns output of neu plugins --help', async() => {
            let output = runner.run('neu plugins --help');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('Usage: neu plugins [options] [plugin]'));
        });
    });
    describe('Test neu plugins --add command', () => {
        it('returns output of neu plugins --add command and adds corresponding plugin', async() => {
            let output = runner.run('neu plugins --add @neutralinojs/appify');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('neu: INFO @neutralinojs/appify was installed!'));
        });
    });
    describe('Test neu plugins command', () => {
        it('returns list of all installed neu plugins', async() => {
            let output = runner.run('neu plugins');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('@neutralinojs/appify'));
        });
    });
    describe('Test neu plugins --remove command', () => {
        it('returns output of neu plugins --remove command and removes corresponding plugin', async() => {
            let output = runner.run('neu plugins --remove @neutralinojs/appify');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('neu: INFO @neutralinojs/appify was uninstalled!'));
        });
    });
});
