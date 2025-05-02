const assert = require('assert');
const runner = require('./runner');
const fs = require('fs');

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
    describe('Test neu create in current directory', () => {
        const tempDirName = 'test-current-dir';
        
        beforeEach(() => {
            try {
                fs.mkdirSync(tempDirName, { recursive: true });
            } catch (err) {
                if (err.code === 'EEXIST') {
                    console.log(`Test directory ${tempDirName} already exists, using existing directory`);
                } else {
                    console.error(`Error creating test directory: ${err.message}`);
                    throw err;
                }
            }
            process.chdir(tempDirName);
        });
        
        it('returns with successfully creating neutralinojs app in current directory', async() => {
            let output = runner.run('neu create .');
            
            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('neu: INFO Enter \'neu run\' to run your application'));
            assert.ok(fs.existsSync('neutralino.config.json'), 'Config file should exist');
            assert.ok(fs.existsSync('bin'), 'Binary directory should exist');
        });
        
        afterEach(() => {
            process.chdir('..');
        });
    });
    after(() => {
        runner.cleanup();
    });
});
