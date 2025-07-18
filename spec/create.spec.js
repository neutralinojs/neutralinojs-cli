const assert = require('assert');
const runner = require('./runner');

describe('Run neu create command and its options', () => {
    describe('Test neu create --help command', () => {
        it('returns output of neu create --help', async() => {
            let output = runner.run('neu create --help');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('Usage: neu create [options] <binaryName>'));
        });
    });
    describe('Test neu test app creation', () => {
        it('returns with successfully creating neutralinojs app', async() => {
            let output = runner.run('neu create test-app');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('neu: INFO Enter \'cd test-app && neu run\' to run your application'));
        });
        it('returns with successfully creating neutralinojs app with specified template', async() => {
            let output = runner.run('neu create test-template-app --template=neutralinojs/neutralinojs-zero');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('neu: INFO Enter \'cd test-template-app && neu run\' to run your application'));
        });
    });
    describe('Test app creation in the current directory', () => {
        it('returns with successfully creating neutralinojs app in the current directory', async() => {
            let output = runner.run('neu create .');
            
            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('Enter \'cd . && neu run\' to run your application.'));
        });
    });
    after(() => {
        runner.cleanup();
    });
});
