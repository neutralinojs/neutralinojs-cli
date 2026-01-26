#!/usr/bin/env node

const { Command } = require('commander');
const neu = require('../src/neu-cli');
const utils = require('../src/utils');

const program = new Command();
program
  .showHelpAfterError()
  .showSuggestionAfterError(true);

neu.bootstrap(program);

program.addHelpText('beforeAll', utils.getFiglet());
program.parse(process.argv);

