const assert = require('assert');
const runner = require('./runner');
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const constants = require('../src/constants');

describe('Run neu run command and its options', () => {
    describe('Test neu run --help command', () => {
        it('returns output of neu run --help', async() => {
            let output = runner.run('neu run --help');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('Usage: neu run [options]'));
        });
    });

    describe('Run failures', () => {
        let project;

        beforeEach(() => {
            project = fs.mkdtempSync(path.join(os.tmpdir(), 'neu-run-'));
            fs.writeFileSync(path.join(project, 'neutralino.config.json'), JSON.stringify({
                applicationId: 'js.neutralino.run-test',
                cli: { resourcesPath: '/resources' }
            }));
        });

        afterEach(() => {
            fs.rmSync(project, { recursive: true, force: true });
        });

        function runApp(args = []) {
            return spawnSync(process.execPath, [path.join(__dirname, '../bin/neu.js'),
                'run', '--disable-auto-reload', ...args], {
                cwd: project, encoding: 'utf8', timeout: 5000
            });
        }

        it('reports unsupported architectures as errors and exits unsuccessfully', () => {
            const output = runApp(['--arch', 'invalid_arch']);
            assert.equal(output.error, undefined);
            assert.equal(output.status, 1);
            assert.ok(output.stderr.includes('Unsupported platform or CPU architecture'));
        });

        const unixTest = process.platform === 'win32' ? it.skip : it;
        for (const code of [0, 7]) {
            unixTest(`propagates a child process exit code of ${code}`, () => {
                const binary = constants.files.binaries[process.platform][process.arch];
                fs.mkdirSync(path.join(project, 'bin'));
                fs.writeFileSync(path.join(project, 'bin', binary), `#!/bin/sh\nexit ${code}\n`);
                const output = runApp();
                assert.equal(output.error, undefined);
                assert.equal(output.status, code === 0 ? 0 : 1);
                if (code !== 0) assert.ok(output.stderr.includes(`error code ${code}`));
            });
        }

        unixTest('reports a signal-terminated child process as a failure', () => {
            const binary = constants.files.binaries[process.platform][process.arch];
            fs.mkdirSync(path.join(project, 'bin'));
            fs.writeFileSync(path.join(project, 'bin', binary), '#!/bin/sh\nkill -TERM $$\n');
            const output = runApp();
            assert.equal(output.error, undefined);
            assert.equal(output.status, 1);
            assert.ok(output.stderr.includes('signal SIGTERM') ||
                output.stderr.includes('error code 143'));
        });
    });
});
