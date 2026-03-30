#!/usr/bin/env node

import { Command } from 'commander'
import * as neu from '../src/neu-cli'
import * as utils from '../src/utils'

const program = new Command()

neu.bootstrap(program as any)

program.addHelpText('beforeAll', utils.getFiglet())

program.parse(process.argv)
