#!/usr/bin/env node

const program  = require('commander');
const neu = require('../src/neu-cli');
const commons = require('../src/commons');

neu.bootstrap(program);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    commons.figlet(() => {
        program.outputHelp();
    });
}


