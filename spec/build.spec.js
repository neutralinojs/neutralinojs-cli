const assert = require('assert');
const runner = require('./runner');
const fs = require('fs');

describe('Run neu build command and its options', () => {
    before(() => {
        runner.run('neu create test-app');
        process.chdir('test-app');
    });
    describe('Test neu build --help command', () => {
        it('returns output of neu build --help', async() => {
            let output = runner.run('neu  build --help');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('Usage: neu build [options]'));
        });
    });
    describe('Test building binaries for supported platforms and resources.neu file', () => {
        it('populates ./dist directory with binaries', async() => {
            let output = runner.run('neu build');
            const binaries = fs.readdirSync('./dist/test-app/');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('Application package was generated at the dist directory!'));
            assert.ok(binaries.includes('resources.neu') &&
                binaries.includes('test-app-linux_arm64') &&
                binaries.includes('test-app-linux_armhf') &&
                binaries.includes('test-app-linux_x64') &&
                binaries.includes('test-app-mac_x64') &&
                binaries.includes('test-app-mac_arm64') &&
                binaries.includes('test-app-mac_universal') &&
                binaries.includes('test-app-win_x64.exe'));
        });
        it('creates & populates ./dist directory with binaries and portable ZIP bundle', async() => {
            let output = runner.run('neu build --release');
            const applicationBundle = fs.readdirSync('./dist/');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('Application package was generated at the dist directory!') &&
                output.data.includes('Making app bundle ZIP file'));
            assert.ok(applicationBundle.includes('test-app-release.zip'));
        });
        it('copies the current snapshot of the Neutralinojs storage to the application bundle', async() => {
            runner.run(' mkdir .storage') // .storage doesn't exist by default in the template
            let output = runner.run('neu build --copy-storage');
            const storageSnapshot = fs.readdirSync('./dist/test-app');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('Application package was generated at the dist directory!') &&
                output.data.includes('Copying binaries') &&
                output.data.includes('Copying storage data'));
            assert.ok(storageSnapshot.includes('.storage'));
        });
    });
    after(() => {
        process.chdir('..');
        runner.cleanup();
    });
});
