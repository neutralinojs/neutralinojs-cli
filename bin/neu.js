#!/usr/bin/env node

import { Command } from 'commander';
import { bootstrap } from '../src/neu-cli';
import { getFiglet } from '../src/utils';

const program = new Command();
bootstrap(program);

program.addHelpText('beforeAll', getFiglet());
program.parse(process.argv);

