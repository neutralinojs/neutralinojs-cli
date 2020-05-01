const package = require('../package.json');
const create = require('../src/commands/create');
const build = require('../src/commands/build');
const run = require('../src/commands/run');
const release = require('../src/commands/release');

module.exports.bootstrap = (program) => {
    program.version(package.version);
    create.register(program);
    build.register(program);
    run.register(program);
    release.register(program);
}