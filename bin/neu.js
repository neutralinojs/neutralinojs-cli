#!/bin/node
const program  = require('commander');
const neu = require('../src/neu-cli');

neu.bootstrap(program);

program.parse(process.argv);


