const create = require('../src/commands/create');
const run = require('../src/commands/run');
const build = require('../src/commands/build');
const update = require('../src/commands/update');
const version = require('../src/commands/version');
const plugins = require('../src/commands/plugins');
const pluginloader = require('../src/plugins/pluginloader');
const modules = require('../src/modules');

module.exports.bootstrap = (program) => {
    create.register(program);
    run.register(program);
    build.register(program);
    update.register(program);
    version.register(program);
    plugins.register(program);
    pluginloader.registerPlugins(program, modules);
}
