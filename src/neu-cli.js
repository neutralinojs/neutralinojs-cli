const package = require('../package.json');
const create = require('../src/commands/create');
const build = require('../src/commands/build');
const run = require('../src/commands/run');

module.exports.bootstrap = (program) => {
    program.version(package.version);
    create.register(program);
    build.register(program);
    run.register(program);
}