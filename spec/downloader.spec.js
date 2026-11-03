const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { Readable, PassThrough } = require('stream');
const { EventEmitter } = require('events');
const { https } = require('follow-redirects');
const zl = require('zip-lib');
const config = require('../src/modules/config');
const downloader = require('../src/modules/downloader');

describe('Downloader module: downloadBinariesFromRelease', () => {
    let originalHttpsGet;
    let originalConfigGet;
    let validZipBuffer;

    before(async () => {
        originalHttpsGet = https.get;
        originalConfigGet = config.get;
        config.get = () => ({
            cli: {
                binaryVersion: '4.6.0',
                clientVersion: '3.5.0'
            }
        });

        const tempZipPath = path.join('.tmp', 'sample.zip');
        fs.mkdirSync('.tmp', { recursive: true });
        const zip = new zl.Zip();
        zip.addFile('package.json', 'package.json');
        await zip.archive(tempZipPath);
        validZipBuffer = fs.readFileSync(tempZipPath);
        fs.unlinkSync(tempZipPath);
    });

    afterEach(() => {
        https.get = originalHttpsGet;
        try {
            if (fs.existsSync('.tmp/binaries.zip')) {
                fs.unlinkSync('.tmp/binaries.zip');
            }
        } catch (e) {}
    });

    after(() => {
        config.get = originalConfigGet;
        try {
            if (fs.existsSync('.tmp')) {
                fs.rmSync('.tmp', { recursive: true, force: true });
            }
        } catch (e) {}
    });

    it('Scenario 1: succeeds on HTTP 200 with valid zip and extracts contents', async () => {
        https.get = (url, cb) => {
            const req = new EventEmitter();
            process.nextTick(() => {
                const res = new Readable({
                    read() {
                        this.push(validZipBuffer);
                        this.push(null);
                    }
                });
                res.statusCode = 200;
                res.headers = { 'content-length': validZipBuffer.length.toString() };
                cb(res);
            });
            return req;
        };

        await downloader.downloadBinariesFromRelease();
        assert.ok(fs.existsSync('.tmp/package.json'), 'Expected package.json to be extracted into .tmp/');
    });

    it('Scenario 2: rejects on HTTP 403, reports HTTP status, and deletes partial file', async () => {
        https.get = (url, cb) => {
            const req = new EventEmitter();
            process.nextTick(() => {
                const res = new Readable({
                    read() {
                        this.push('Access Denied');
                        this.push(null);
                    }
                });
                res.statusCode = 403;
                res.headers = {};
                cb(res);
            });
            return req;
        };

        await assert.rejects(
            async () => {
                await downloader.downloadBinariesFromRelease();
            },
            (err) => {
                assert.ok(err instanceof Error);
                assert.ok(err.message.includes('HTTP 403'), `Expected error message to include HTTP 403, got: ${err.message}`);
                return true;
            }
        );

        await new Promise((resolve) => setTimeout(resolve, 50));
        assert.strictEqual(fs.existsSync('.tmp/binaries.zip'), false, 'Partial binaries.zip should be cleaned up');
    });

    it('Scenario 3: rejects on HTTP 404, reports HTTP status, and deletes partial file', async () => {
        https.get = (url, cb) => {
            const req = new EventEmitter();
            process.nextTick(() => {
                const res = new Readable({
                    read() {
                        this.push('Not Found');
                        this.push(null);
                    }
                });
                res.statusCode = 404;
                res.headers = {};
                cb(res);
            });
            return req;
        };

        await assert.rejects(
            async () => {
                await downloader.downloadBinariesFromRelease();
            },
            (err) => {
                assert.ok(err instanceof Error);
                assert.ok(err.message.includes('HTTP 404'), `Expected error message to include HTTP 404, got: ${err.message}`);
                return true;
            }
        );

        await new Promise((resolve) => setTimeout(resolve, 50));
        assert.strictEqual(fs.existsSync('.tmp/binaries.zip'), false, 'Partial binaries.zip should be cleaned up');
    });

    it('Scenario 4: rejects on HTTP 500, reports HTTP status, and deletes partial file', async () => {
        https.get = (url, cb) => {
            const req = new EventEmitter();
            process.nextTick(() => {
                const res = new Readable({
                    read() {
                        this.push('Internal Server Error');
                        this.push(null);
                    }
                });
                res.statusCode = 500;
                res.headers = {};
                cb(res);
            });
            return req;
        };

        await assert.rejects(
            async () => {
                await downloader.downloadBinariesFromRelease();
            },
            (err) => {
                assert.ok(err instanceof Error);
                assert.ok(err.message.includes('HTTP 500'), `Expected error message to include HTTP 500, got: ${err.message}`);
                return true;
            }
        );

        await new Promise((resolve) => setTimeout(resolve, 50));
        assert.strictEqual(fs.existsSync('.tmp/binaries.zip'), false, 'Partial binaries.zip should be cleaned up');
    });

    it('Scenario 5: rejects cleanly on network failure (request error)', async () => {
        https.get = () => {
            const req = new EventEmitter();
            process.nextTick(() => {
                req.emit('error', new Error('Network connection failed (ENOTFOUND)'));
            });
            return req;
        };

        await assert.rejects(
            async () => {
                await downloader.downloadBinariesFromRelease();
            },
            (err) => {
                assert.ok(err.message.includes('Network connection failed'));
                return true;
            }
        );

        await new Promise((resolve) => setTimeout(resolve, 50));
        assert.strictEqual(fs.existsSync('.tmp/binaries.zip'), false, 'Partial binaries.zip should be cleaned up');
    });

    it('Scenario 5b: rejects cleanly on network failure (response stream error)', async () => {
        https.get = (url, cb) => {
            const req = new EventEmitter();
            process.nextTick(() => {
                const res = new PassThrough();
                res.statusCode = 200;
                res.headers = { 'content-length': '1024' };
                cb(res);
                res.write(Buffer.from('partial-data'));
                process.nextTick(() => {
                    res.emit('error', new Error('Connection reset by peer (ECONNRESET)'));
                });
            });
            return req;
        };

        await assert.rejects(
            async () => {
                await downloader.downloadBinariesFromRelease();
            },
            (err) => {
                assert.ok(err.message.includes('ECONNRESET'));
                return true;
            }
        );

        await new Promise((resolve) => setTimeout(resolve, 50));
        assert.strictEqual(fs.existsSync('.tmp/binaries.zip'), false, 'Partial binaries.zip should be cleaned up');
    });

    it('Scenario 6: rejects cleanly on file write failure', async () => {
        const originalCreateWriteStream = fs.createWriteStream;
        fs.createWriteStream = () => {
            const fakeStream = new PassThrough();
            fakeStream.close = (cb) => {
                fakeStream.destroy();
                if (cb) cb();
            };
            process.nextTick(() => {
                fakeStream.emit('error', new Error('Disk full write failure (ENOSPC)'));
            });
            return fakeStream;
        };

        try {
            await assert.rejects(
                async () => {
                    await downloader.downloadBinariesFromRelease();
                },
                (err) => {
                    assert.ok(err.message.includes('ENOSPC'));
                    return true;
                }
            );
        } finally {
            fs.createWriteStream = originalCreateWriteStream;
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
    });

    it('Scenario 7: rejects cleanly on incomplete download without extraction', async () => {
        https.get = (url, cb) => {
            const req = new EventEmitter();
            process.nextTick(() => {
                const res = new PassThrough();
                res.statusCode = 200;
                res.headers = { 'content-length': '1000' };
                cb(res);
                // Send only 10 bytes instead of 1000, then end cleanly
                res.write(Buffer.from('0123456789'));
                res.end();
            });
            return req;
        };

        await assert.rejects(
            async () => {
                await downloader.downloadBinariesFromRelease();
            },
            (err) => {
                assert.ok(err.message.includes('Incomplete download'), `Expected incomplete download message, got: ${err.message}`);
                return true;
            }
        );

        await new Promise((resolve) => setTimeout(resolve, 50));
        assert.strictEqual(fs.existsSync('.tmp/binaries.zip'), false, 'Incomplete binaries.zip should be cleaned up');
    });
});
