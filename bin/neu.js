#!/usr/bin/env node

const { Command } = require('commander');
const neu = require('../src/neu-cli');
const commons = require('../src/commons');
const chalk = require('chalk');

const program = new Command();
neu.bootstrap(program);

program.addHelpText('beforeAll', commons.getFiglet());
program.parse(process.argv);

