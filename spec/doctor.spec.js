const assert = require('assert');
const runner = require('./runner');
const fs = require('fs');
const path = require('path');

const cliPath = path.resolve(__dirname, '../bin/neu.js');

describe('Run neu doctor command', () => {

    describe('Test neu doctor outside a project', () => {
        before(() => {
            if (!fs.existsSync('empty-dir')) {
                fs.mkdirSync('empty-dir');
            }
            process.chdir('empty-dir');
        });

				it('returns error when not in a Neutralino project', async () => {
						let output = runner.run(`node ${cliPath} doctor`);

						let fullOutput = (output.data || '') + (output.error || '');

						assert.ok(fullOutput.includes('Unable to find neutralino.config.json'));
						assert.strictEqual(output.status, 1);
				});

        after(() => {
            process.chdir('..');
            if (fs.existsSync('empty-dir')) {
                fs.rmSync('empty-dir', { recursive: true, force: true });
            }
        });
    });

    describe('Test neu doctor inside a project environment', () => {
        before(() => {
            runner.run(`node ${cliPath} create test-app`);
            process.chdir('test-app');

            if (!fs.existsSync('res')) fs.mkdirSync('res');
            fs.writeFileSync(path.join('res', 'index.html'), '<html></html>');

            if (!fs.existsSync('bin')) fs.mkdirSync('bin');
            const binaryName = process.platform === 'win32' ? 'neutralino-win_x64.exe' : 'neutralino-linux_x64';
            fs.writeFileSync(path.join('bin', binaryName), '');
        });

        it('returns success for a healthy project', async () => {
            let output = runner.run(`node ${cliPath} doctor`);

            assert.strictEqual(output.error, null);
            assert.ok(output.data.includes('Diagnostic completed'));
            assert.ok(output.data.includes('Happy coding'));
            assert.strictEqual(output.status, 0);
        });

        it('detects missing binaries if bin folder is deleted', async () => {
						if (fs.existsSync('bin')) fs.rmSync('bin', { recursive: true, force: true });

						let output = runner.run(`node ${cliPath} doctor`);

						let fullOutput = (output.data || '') + (output.error || '');

						assert.ok(fullOutput.includes('Folder "bin" is missing'));
						assert.strictEqual(output.status, 1);
				});

        after(() => {
            if (process.cwd().endsWith('test-app')) {
                process.chdir('..');
            }
            runner.cleanup();
        });
    });
});
