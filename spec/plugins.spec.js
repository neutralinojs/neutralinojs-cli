const assert = require('assert');
const runner = require('./runner');
const fs = require('fs');
const path = require('path');

describe('Run neu plugins command and its options', function() {

    this.timeout(0); 

    describe('Test neu plugins --help command', () => {
        it('returns output of neu plugins --help', async () => {
            let output = runner.run('neu plugins --help');
            assert.strictEqual(output.status, 0);
            assert.ok(output.data.includes('Usage: neu plugins [options] [plugin]'));
        });
    });

    describe('Test neu plugins --add command', () => {
        it('adds corresponding plugin', async () => {
            let output = runner.run('neu plugins --add @neutralinojs/appify');
            
            assert.strictEqual(output.status, 0);
            assert.ok(output.data.includes('installed'));
        });
    });

    describe('Test neu plugins command (list)', () => {
        it('returns list of all installed neu plugins', async () => {
            let output = runner.run('neu plugins');
            
            assert.strictEqual(output.status, 0);
            assert.ok(output.data.includes('@neutralinojs/appify'));
        });
    });

    describe('Test neu plugins --remove command', () => {
        it('removes corresponding plugin', async () => {
            let output = runner.run('neu plugins --remove @neutralinojs/appify');
            
            assert.strictEqual(output.status, 0);
            assert.ok(output.data.includes('uninstalled'));
        });
    });
});