const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createRequire } = require('module');
const { EventEmitter } = require('events');
const package = require('../package.json');

function loadModule(file, stubs, output = []) {
    const filename = path.join(__dirname, '..', file);
    const localRequire = createRequire(filename);
    const module = { exports: {} };
    vm.runInNewContext(fs.readFileSync(filename, 'utf8'), {
        module, exports: module.exports,
        require: name => Object.prototype.hasOwnProperty.call(stubs, name) ? stubs[name] : localRequire(name),
        console: { log: message => output.push(message), warn() {}, error() {} },
        setTimeout: callback => setTimeout(callback, 20), clearTimeout
    }, { filename });
    return module.exports;
}

describe('Offline version checks', function() {
    this.timeout(500);

    for (const [error, output, expected] of [
        [new Error('offline'), '', null],
        [new Error('npm unavailable'), undefined, null],
        [null, '', null],
        [null, package.version + '\n', true],
        [null, '99.0.0\n', false]
    ]) {
        it(`handles npm output ${JSON.stringify(output)} with error ${!!error}`, async () => {
            const utils = loadModule('src/utils.js', {
                child_process: { exec: (command, callback) => {
                    setImmediate(() => callback(error, output));
                    return { pid: 123 };
                } },
                'tree-kill': () => {}
            });
            assert.strictEqual(await utils.checkLatestVersion(), expected);
        });
    }

    it('stops a stalled npm process tree and reports an unknown version', async () => {
        const killed = [];
        const utils = loadModule('src/utils.js', {
            child_process: { exec: () => ({ pid: 123 }) },
            'tree-kill': pid => killed.push(pid)
        });
        assert.strictEqual(await utils.checkLatestVersion(), null);
        assert.deepStrictEqual(killed, [123]);
    });

    function downloader(responseFactory) {
        const request = new EventEmitter();
        request.destroy = error => {
            request.destroyed = true;
            request.emit('error', error);
        };
        const module = loadModule('src/modules/downloader.js', {
            'follow-redirects': { https: { get: (url, options, callback) => {
                if(responseFactory) setImmediate(() => responseFactory(callback, request));
                return request;
            } } }
        });
        return { module, request };
    }

    it('destroys a stalled release request and rejects', async () => {
        const { module, request } = downloader();
        await assert.rejects(module.getRemoteLatestVersion('neutralinojs', 5000), /timed out/);
        assert.strictEqual(request.destroyed, true);
    });

    it('returns a successful release version', async () => {
        const { module } = downloader(callback => {
            const response = new EventEmitter();
            response.statusCode = 200;
            callback(response);
            response.emit('data', JSON.stringify({ tag_name: 'v6.5.0' }));
            response.emit('end');
        });
        assert.strictEqual(await module.getRemoteLatestVersion('neutralinojs'), '6.5.0');
    });

    for (const [status, body] of [[403, '{}'], [200, 'invalid JSON']]) {
        it(`rejects an invalid release response with status ${status}`, async () => {
            const { module } = downloader(callback => {
                const response = new EventEmitter();
                response.statusCode = status;
                callback(response);
                response.emit('data', body);
                response.emit('end');
            });
            await assert.rejects(module.getRemoteLatestVersion('neutralinojs'));
        });
    }

    it('still displays installed project versions when release checks fail', async () => {
        const output = [];
        let action;
        const command = loadModule('src/commands/version.js', {
            '../utils': { showArt() {}, checkLatestVersion: async () => null,
                isNeutralinojsProject: () => true, getVersionTag: version => 'v' + version,
                warn: message => output.push(message), log: message => output.push(message) },
            '../modules/config': { get: () => ({ applicationId: 'test.app', version: '1.0.0',
                cli: { binaryName: 'test-app', binaryVersion: '6.5.0', clientVersion: '6.5.0' } }) },
            '../modules/downloader': { getRemoteLatestVersion: async () => { throw new Error('offline'); } }
        }, output);
        // Capture the action through the same registration interface used by Commander.
        command.register({ command() { return this; }, description() { return this; },
            action(handler) { action = handler; return this; } });
        await action();
        assert.ok(output.some(message => message.includes('Neutralinojs binaries: v6.5.0')));
        assert.ok(output.some(message => message.includes('Project version: v1.0.0')));
        assert.ok(!output.some(message => message.includes('(latest)')));
        assert.ok(output.some(message => message.includes('Unable to check')));
        assert.ok(!output.some(message => message.includes('doesn\'t use the latest')));
    });
});
