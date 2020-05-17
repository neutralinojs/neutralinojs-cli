const package = require('../package.json');
const create = require('../src/commands/create');
const build = require('../src/commands/build');
const run = require('../src/commands/run');
const release = require('../src/commands/release');
const update = require('../src/commands/update');
const plugins = require('../src/commands/plugins');
const pluginloader = require('../src/plugins/pluginloader');
const modules = require('../src/modules');

module.exports.bootstrap = (program) => {
    program.version(package.version);
    create.register(program);
    build.register(program);
    run.register(program);
    release.register(program);
    update.register(program);
    plugins.register(program);
    pluginloader.registerPlugins(program, modules);
}