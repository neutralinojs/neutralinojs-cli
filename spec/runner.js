const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const neuBin = `"${process.execPath}" "${path.resolve(__dirname, '../bin/neu.js')}"`;

function run(command, options = {}) {
    let cmd = command;
    if (cmd.startsWith('neu ') || cmd === 'neu') {
        cmd = cmd.replace(/^neu/, neuBin);
    }

    const execOptions = {
        ...options,
        shell: true,
        env: { ...process.env, ...(options.env || {}) },
        encoding: 'utf8'
    };

    const res = spawnSync(cmd, execOptions);
    const stdout = res.stdout || '';
    const stderr = res.stderr || '';
    const combined = stdout + (stderr ? (stdout ? '\n' : '') + stderr : '');

    return {
        error: res.error ? res.error.toString() : (res.status !== 0 ? (stderr || stdout || `Command failed with code ${res.status}`) : null),
        data: combined,
        stdout: stdout,
        stderr: stderr,
        status: res.status !== null ? res.status : 1
    };
}

function cleanup() {
    try {
        fs.rmSync('./test-app', { recursive: true, force: true });
        fs.rmSync('./test-template-app', { recursive: true, force: true });
        fs.rmSync('./test-fixture-app', { recursive: true, force: true });
        fs.rmSync('./test-fixture-host-app', { recursive: true, force: true });
        fs.rmSync('./test-traversal-app', { recursive: true, force: true });
        fs.rmSync('./test-symlink-app', { recursive: true, force: true });
        fs.rmSync('./test-piped-app', { recursive: true, force: true });
        fs.rmSync('./test-closed-stdin-app', { recursive: true, force: true });
        fs.rmSync('./test-precedence-app', { recursive: true, force: true });
        fs.rmSync('./test-chained-app', { recursive: true, force: true });
        fs.rmSync('./outside-marker.txt', { force: true });
        fs.rmSync('./symlink-marker.txt', { force: true });
        fs.rmSync('./marker1.txt', { force: true });
        fs.rmSync('./marker2.txt', { force: true });
        fs.rmSync('./neutralino.config.json', { force: true });
        fs.rmSync('./resources', { recursive: true, force: true });
        fs.rmSync('./temp-outside-dir', { recursive: true, force: true });
        fs.rmSync(path.resolve(__dirname, 'fixtures/symlink-template/symlink-dir'), { recursive: true, force: true });
    }
    catch(err) {
        // ignore
    }
}

function updateVersions(binaryVersion, clientVersion) {
    const file = 'neutralino.config.json';
    const config = JSON.parse(fs.readFileSync(file));
    
    config['cli']['binaryVersion'] = binaryVersion;
    config['cli']['clientVersion'] = clientVersion;
    fs.writeFileSync(file, JSON.stringify(config, null, 2));
}

module.exports = {
    cleanup,
    updateVersions,
    run
}
