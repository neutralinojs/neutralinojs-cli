const package = require('../package.json');
const create = require('../src/commands/create');
const run = require('../src/commands/run');
const build = require('../src/commands/build');
const update = require('../src/commands/update');
const listen = require('../src/commands/listen');
const plugins = require('../src/commands/plugins');
const pluginloader = require('../src/plugins/pluginloader');
const modules = require('../src/modules');

module.exports.bootstrap = (program) => {
    program.version(package.version);
    create.register(program);
    run.register(program);
    build.register(program);
    update.register(program);
    listen.register(program);
    plugins.register(program);
    pluginloader.registerPlugins(program, modules);
}
