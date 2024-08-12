const process = require('process');
const spawnCommand = require('spawn-command');
const config = require('./config');
const utils = require('../utils');

module.exports.containsRunnerApp = () => {
  let configObj = config.get();
  return !!(configObj.cli && configObj.cli.projectRunner);
}

module.exports.runCommand = async (commandKey) => {
  let configObj = config.get();
  let projectRunner = configObj.cli ? configObj.cli.projectRunner : undefined;

  if (projectRunner && projectRunner.projectPath && projectRunner[commandKey]) {

      return new Promise((resolve, _reject) => {
          let projectPath = utils.trimPath(projectRunner.projectPath);
          let cmd = projectRunner[commandKey];

          utils.log(`Running ${commandKey}: ${cmd}...`);

          const proc = spawnCommand(cmd, { stdio: 'inherit', cwd: projectPath});
          proc.on('exit', (code) => {
              utils.log(`Project Runner: ${commandKey} completed with exit code: ${code}`);
              resolve();
          });
      });
  }
}

module.exports.runApp = async () => {
  let configObj = config.get();
  let projectRunner = configObj.cli ? configObj.cli.projectRunner : undefined;

  if (projectRunner && projectRunner.projectPath && projectRunner.devCommand) {
      return new Promise((resolve, _reject) => {
          let projectPath = utils.trimPath(projectRunner.projectPath);
          let cmd = projectRunner.devCommand;

          utils.log(`Running Project Runner: ${cmd} ...`);
          const proc = spawnCommand(cmd, { stdio: 'inherit', cwd: projectPath});
          proc.on('exit', (code) => {
              utils.log(`Project stopped with exit code: ${code}`);
              resolve();
          });
      });
  } else {
    utils.error("Config file does not contain projectRunner.devCommand to run the project!!!");
    process.exit(1);
  }
}