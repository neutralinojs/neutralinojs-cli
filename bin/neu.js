#!/usr/bin/env node

const program  = require('commander');
const neu = require('../src/neu-cli');
const commons = require('../src/commons');
const chalk = require('chalk');


///--- v2 notice ----------
console.log();
console.log(chalk.red.bold.bgWhite("------- Notice --------"));
console.log(`
Neutralino v2 is ready for Linux/Windows. You can try v2.0.0 pre-release.
Please notice that the macOS version is not yet supporting v2 implementaton (still in v1.5.0).
If you are interested, you can help <3 us to implement v2-spec for macOS.
Checkout more info: https://github.com/neutralinojs/neutralinojs
`);

neu.bootstrap(program);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    commons.figlet(() => {
        program.outputHelp();
    });
}


