const assert = require('assert');
const fs = require('fs');
const path = require('path');
const runner = require('./runner');
const creator = require('../src/modules/creator');
const utils = require('../src/utils');

describe('Run neu create command and its options', () => {
    describe('Test neu create --help command', () => {
        it('returns output of neu create --help', async() => {
            let output = runner.run('neu create --help');

            assert.equal(output.error, null);
            assert.equal(output.status, 0);
            assert.ok(typeof output.data == 'string');
            assert.ok(output.data.includes('Usage: neu create [options] <binaryName>'));
            assert.ok(output.data.includes('--run-init'));
            assert.ok(output.data.includes('--yes'));
            assert.ok(output.data.includes('--no-init'));
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

    describe('Security #471: Template initCommand consent and execution hardening', () => {
        const fixtureTemplate = path.resolve(__dirname, 'fixtures/init-template');
        const hostFixtureTemplate = path.resolve(__dirname, 'fixtures/host-template');
        const traversalFixtureTemplate = path.resolve(__dirname, 'fixtures/traversal-template');
        const chainedFixtureTemplate = path.resolve(__dirname, 'fixtures/chained-template');
        const symlinkFixtureTemplate = path.resolve(__dirname, 'fixtures/symlink-template');

        afterEach(() => {
            runner.cleanup();
        });

        describe('1. Official template verification strictness (isOfficialTemplate)', () => {
            it('should trust official neutralinojs templates exactly', () => {
                assert.strictEqual(creator.isOfficialTemplate('neutralinojs/neutralinojs-minimal'), true);
                assert.strictEqual(creator.isOfficialTemplate('neutralinojs/neutralinojs-zero'), true);
                assert.strictEqual(creator.isOfficialTemplate('NEUTRALINOJS/neutralinojs-minimal'), true);
                assert.strictEqual(creator.isOfficialTemplate('neutralinojs/my-template_v2'), true);
                assert.strictEqual(creator.isOfficialTemplate('neutralinojs/template.js'), true);
            });

            it('should reject non-official or malicious template strings', () => {
                const invalidTemplates = [
                    'neutralinojs/repo/extra',
                    'neutralinojs/../evil',
                    'neutralinojs/repo#branch',
                    'neutralinojs/repo@ref',
                    'NeutralinoJS-evil/repo',
                    'neutralinojs-evil/repo',
                    'https://github.com/neutralinojs/neutralinojs-minimal',
                    './local',
                    '/abs/path',
                    'C:\\path',
                    '',
                    ' neutralinojs/repo',
                    'neutralinojs/ repo',
                    'neutralinojs/repo ',
                    'neutralinojs/repo\0evil',
                    'attacker/neutralinojs',
                    'neutralinojs',
                    'neutralinojs/',
                    '/neutralinojs',
                    'neutralinojs/.',
                    'neutralinojs/..',
                    fixtureTemplate,
                    null,
                    undefined
                ];

                for (const tmpl of invalidTemplates) {
                    assert.strictEqual(creator.isOfficialTemplate(tmpl), false, `Should reject template: ${tmpl}`);
                }
            });
        });

        describe('2. Consent enforcement and flags with fixture template', () => {
            it('default non-interactive run must NOT execute initCommand and marker must NOT exist', () => {
                const output = runner.run(`neu create test-fixture-app --template "${fixtureTemplate}"`);

                assert.equal(output.error, null);
                assert.equal(output.status, 0);
                assert.strictEqual(fs.existsSync('test-fixture-app/marker.txt'), false, 'Marker file must not exist');
                assert.ok(output.data.includes('The template defines the following initialization command:'));
                assert.ok(output.data.includes('node -e "require(\'fs\').writeFileSync(\'marker.txt\', \'pwned\')"'));
                assert.ok(output.data.includes('Skipping initialization command because the environment is non-interactive.'));
                assert.ok(output.data.includes('--run-init or --yes'));
                assert.ok(output.data.includes('You can run it manually later:'));
            });

            it('--no-init must never run initCommand, never prompt, and marker must NOT exist', () => {
                const output = runner.run(`neu create test-fixture-app --template "${fixtureTemplate}" --no-init`);

                assert.equal(output.error, null);
                assert.equal(output.status, 0);
                assert.strictEqual(fs.existsSync('test-fixture-app/marker.txt'), false, 'Marker file must not exist');
                assert.ok(output.data.includes('Skipping template initialization command (--no-init specified)'));
                assert.strictEqual(output.data.includes('Do you want to run this command?'), false);
            });

            it('--run-init must execute initCommand without prompt and marker MUST exist', () => {
                const output = runner.run(`neu create test-fixture-app --template "${fixtureTemplate}" --run-init`);

                assert.equal(output.error, null);
                assert.equal(output.status, 0);
                assert.strictEqual(fs.existsSync('test-fixture-app/marker.txt'), true, 'Marker file must exist with --run-init');
                assert.strictEqual(output.data.includes('Do you want to run this command?'), false);
            });

            it('--yes must execute initCommand without prompt and marker MUST exist', () => {
                const output = runner.run(`neu create test-fixture-app --template "${fixtureTemplate}" --yes`);

                assert.equal(output.error, null);
                assert.equal(output.status, 0);
                assert.strictEqual(fs.existsSync('test-fixture-app/marker.txt'), true, 'Marker file must exist with --yes');
                assert.strictEqual(output.data.includes('Do you want to run this command?'), false);
            });

            it('-y must execute initCommand without prompt and marker MUST exist', () => {
                const output = runner.run(`neu create test-fixture-app --template "${fixtureTemplate}" -y`);

                assert.equal(output.error, null);
                assert.equal(output.status, 0);
                assert.strictEqual(fs.existsSync('test-fixture-app/marker.txt'), true, 'Marker file must exist with -y');
                assert.strictEqual(output.data.includes('Do you want to run this command?'), false);
            });

            it('interactive run declining prompt: marker must NOT exist and command displayed before prompt', () => {
                const output = runner.run(`neu create test-fixture-app --template "${fixtureTemplate}"`, {
                    input: 'n\n',
                    env: { NEU_FORCE_TTY: 'true' }
                });

                assert.equal(output.error, null);
                assert.equal(output.status, 0);
                assert.strictEqual(fs.existsSync('test-fixture-app/marker.txt'), false, 'Marker file must not exist when declined');
                
                const cmdIndex = output.data.indexOf('node -e');
                const promptIndex = output.data.indexOf('Do you want to run this command?');
                assert.ok(cmdIndex !== -1, 'Command must be displayed');
                assert.ok(promptIndex !== -1, 'Prompt must be displayed');
                assert.ok(cmdIndex < promptIndex, 'Command must be displayed before prompt');
                assert.ok(output.data.includes('Initialization command skipped.'));
                assert.ok(output.data.includes('You can run it manually later:'));
            });

            it('interactive run consenting with "yes": marker MUST exist', () => {
                const output = runner.run(`neu create test-fixture-app --template "${fixtureTemplate}"`, {
                    input: 'yes\n',
                    env: { NEU_FORCE_TTY: 'true' }
                });

                assert.equal(output.error, null);
                assert.equal(output.status, 0);
                assert.strictEqual(fs.existsSync('test-fixture-app/marker.txt'), true, 'Marker file must exist when consented');
            });

            it('interactive run consenting with "y": marker MUST exist', () => {
                const output = runner.run(`neu create test-fixture-app --template "${fixtureTemplate}"`, {
                    input: 'y\n',
                    env: { NEU_FORCE_TTY: 'true' }
                });

                assert.equal(output.error, null);
                assert.equal(output.status, 0);
                assert.strictEqual(fs.existsSync('test-fixture-app/marker.txt'), true, 'Marker file must exist when consented');
            });

            it('interactive run with empty input (default No): marker must NOT exist', () => {
                const output = runner.run(`neu create test-fixture-app --template "${fixtureTemplate}"`, {
                    input: '\n',
                    env: { NEU_FORCE_TTY: 'true' }
                });

                assert.equal(output.error, null);
                assert.equal(output.status, 0);
                assert.strictEqual(fs.existsSync('test-fixture-app/marker.txt'), false, 'Marker file must not exist with default No');
                assert.ok(output.data.includes('Initialization command skipped.'));
            });

            it('applies consent requirement to hostProject.initCommand', () => {
                const out1 = runner.run(`neu create test-fixture-host-app --template "${hostFixtureTemplate}"`);
                assert.equal(out1.status, 0);
                assert.strictEqual(fs.existsSync('test-fixture-host-app/host-marker.txt'), false);
                assert.ok(out1.data.includes('Skipping initialization command because the environment is non-interactive.'));
                runner.cleanup();

                const out2 = runner.run(`neu create test-fixture-host-app --template "${hostFixtureTemplate}" --run-init`);
                assert.equal(out2.status, 0);
                assert.strictEqual(fs.existsSync('test-fixture-host-app/host-marker.txt'), true);
            });
        });

        describe('3. Flag precedence: --no-init takes precedence over --run-init / --yes', () => {
            it('--no-init wins when passed with --run-init', () => {
                const output = runner.run(`neu create test-precedence-app --template "${fixtureTemplate}" --run-init --no-init`);
                assert.equal(output.status, 0);
                assert.strictEqual(fs.existsSync('test-precedence-app/marker.txt'), false, 'Marker file must not exist when --no-init is passed');
                assert.ok(output.data.includes('Skipping template initialization command (--no-init specified)'));
            });

            it('--no-init wins when passed with --yes', () => {
                const output = runner.run(`neu create test-precedence-app --template "${fixtureTemplate}" --yes --no-init`);
                assert.equal(output.status, 0);
                assert.strictEqual(fs.existsSync('test-precedence-app/marker.txt'), false, 'Marker file must not exist when --no-init is passed');
            });

            it('--no-init wins when passed with -y', () => {
                const output = runner.run(`neu create test-precedence-app --template "${fixtureTemplate}" -y --no-init`);
                assert.equal(output.status, 0);
                assert.strictEqual(fs.existsSync('test-precedence-app/marker.txt'), false, 'Marker file must not exist when --no-init is passed');
            });
        });

        describe('4. TTY detection and non-interactive handling', () => {
            it('piped stdin without TTY must NOT run initCommand even if input is provided', () => {
                // Without NEU_FORCE_TTY, piped stdin is non-interactive
                const output = runner.run(`neu create test-piped-app --template "${fixtureTemplate}"`, {
                    input: 'yes\n'
                });
                assert.equal(output.status, 0);
                assert.strictEqual(fs.existsSync('test-piped-app/marker.txt'), false, 'Piped stdin without TTY must not run command');
                assert.ok(output.data.includes('Skipping initialization command because the environment is non-interactive.'));
            });

            it('closed/ignored stdin must NOT run initCommand and must not hang', () => {
                const output = runner.run(`neu create test-closed-stdin-app --template "${fixtureTemplate}"`, {
                    stdio: ['ignore', 'pipe', 'pipe']
                });
                assert.equal(output.status, 0);
                assert.strictEqual(fs.existsSync('test-closed-stdin-app/marker.txt'), false, 'Closed stdin must not run command');
                assert.ok(output.data.includes('Skipping initialization command because the environment is non-interactive.'));
            });
        });

        describe('5. Path traversal, symlink escape & error handling', () => {
            it('path traversal rejection: refuses to run command outside project directory', () => {
                const output = runner.run(`neu create test-traversal-app --template "${traversalFixtureTemplate}" --run-init`);
                assert.strictEqual(fs.existsSync('outside-marker.txt'), false, 'Traversal marker must not exist outside');
                assert.ok(output.data.includes('resolves outside the project directory') || (output.error && output.error.includes('resolves outside the project directory')));
            });

            it('symlink escape: refuses to run command when projectPath is a symlink pointing outside', function() {
                const tempOutsideDir = path.resolve(__dirname, 'temp-outside-dir');
                const symlinkPath = path.resolve(symlinkFixtureTemplate, 'symlink-dir');

                try {
                    fs.mkdirSync(tempOutsideDir, { recursive: true });
                    if (fs.existsSync(symlinkPath)) {
                        fs.rmSync(symlinkPath, { recursive: true, force: true });
                    }
                    try {
                        fs.symlinkSync(tempOutsideDir, symlinkPath, process.platform === 'win32' ? 'junction' : 'dir');
                    } catch (symlinkErr) {
                        if (process.platform === 'win32' || symlinkErr.code === 'EPERM' || symlinkErr.code === 'EACCES') {
                            console.log('Skipping symlink test: symlink creation requires elevated privileges on Windows');
                            return this.skip();
                        }
                        throw symlinkErr;
                    }

                    const output = runner.run(`neu create test-symlink-app --template "${symlinkFixtureTemplate}" --run-init`);
                    assert.strictEqual(fs.existsSync(path.join(tempOutsideDir, 'symlink-marker.txt')), false, 'Symlink marker must not exist outside');
                    assert.ok(output.data.includes('resolves outside the project directory') || (output.error && output.error.includes('resolves outside the project directory')));
                } finally {
                    try {
                        if (fs.existsSync(symlinkPath)) {
                            fs.rmSync(symlinkPath, { recursive: true, force: true });
                        }
                        if (fs.existsSync(tempOutsideDir)) {
                            fs.rmSync(tempOutsideDir, { recursive: true, force: true });
                        }
                    } catch (e) {}
                }
            });

            it('nonexistent projectPath handled gracefully without crashing', () => {
                const validation = utils.validateProjectPath('completely-nonexistent-subpath', '.');
                assert.strictEqual(validation.valid, false);
                assert.ok(validation.error.includes('does not exist'));
            });
        });

        describe('6. Command execution and shell handling', () => {
            it('executes chained commands with && correctly when authorized', () => {
                const output = runner.run(`neu create test-chained-app --template "${chainedFixtureTemplate}" --run-init`);
                assert.equal(output.status, 0);
                assert.strictEqual(fs.existsSync('test-chained-app/marker1.txt'), true, 'marker1.txt must exist');
                assert.strictEqual(fs.existsSync('test-chained-app/marker2.txt'), true, 'marker2.txt must exist');
            });
        });
    });

    after(() => {
        runner.cleanup();
    });
});
