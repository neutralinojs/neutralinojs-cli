const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { createRequire } = require('module');

const unixDescribe = process.platform === 'win32' ? describe.skip : describe;
unixDescribe('Plugin commands from an installation path containing spaces', function() {
    this.timeout(5000);
    let directory, root, log, originalPath, originalLog;

    beforeEach(() => {
        directory = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'neu-plugin-')));
        root = path.join(directory, 'cli with spaces');
        fs.mkdirSync(root);
        const bin = path.join(directory, 'bin');
        fs.mkdirSync(bin);
        log = path.join(directory, 'npm-calls.jsonl');
        const npm = path.join(bin, 'npm');
        fs.writeFileSync(npm, '#!/usr/bin/env node\n' +
            'require("fs").appendFileSync(process.env.NEU_PLUGIN_TEST_LOG, ' +
            'JSON.stringify({cwd: process.cwd(), args: process.argv.slice(2)}) + "\\n");\n');
        fs.chmodSync(npm, 0o755);
        originalPath = process.env.PATH;
        originalLog = process.env.NEU_PLUGIN_TEST_LOG;
        process.env.PATH = bin + path.delimiter + originalPath;
        process.env.NEU_PLUGIN_TEST_LOG = log;
    });

    afterEach(() => {
        process.env.PATH = originalPath;
        if(originalLog === undefined) delete process.env.NEU_PLUGIN_TEST_LOG;
        else process.env.NEU_PLUGIN_TEST_LOG = originalLog;
        fs.rmSync(directory, {recursive: true, force: true});
    });

    function loadPlugins(installed = []) {
        const filename = path.join(__dirname, '../src/plugins/pluginloader.js');
        const localRequire = createRequire(filename);
        const values = {plugins: installed};
        class Configstore {
            has(key) { return key in values; }
            get(key) { return values[key]; }
            set(key, value) { values[key] = value; }
        }
        const requireModule = name => name === 'configstore' ? Configstore :
            name === '../utils' ? {log() {}, error() {}} : localRequire(name);
        requireModule.resolve = () => { throw new Error('test plugin is not installed'); };
        const module = {exports: {}};
        vm.runInNewContext(fs.readFileSync(filename, 'utf8'), {
            module, exports: module.exports, require: requireModule,
            __dirname: path.join(root, 'src/plugins'), process, console
        }, {filename});
        return {plugins: module.exports, values};
    }

    it('installs in the CLI directory and records the plugin', async () => {
        const {plugins, values} = loadPlugins();
        await plugins.add('neu-path-test-plugin');
        const call = JSON.parse(fs.readFileSync(log, 'utf8').trim());
        assert.deepStrictEqual(call, {cwd: root, args: ['install', 'neu-path-test-plugin']});
        assert.deepStrictEqual(values.plugins, ['neu-path-test-plugin']);
    });

    it('uninstalls in the CLI directory and removes the plugin record', async () => {
        const {plugins, values} = loadPlugins(['neu-path-test-plugin']);
        await plugins.remove('neu-path-test-plugin');
        const call = JSON.parse(fs.readFileSync(log, 'utf8').trim());
        assert.deepStrictEqual(call, {cwd: root, args: ['uninstall', '--save', 'neu-path-test-plugin']});
        assert.deepStrictEqual(values.plugins, []);
    });
});
