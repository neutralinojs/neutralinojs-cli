const process = require('process');
const spawnCommand = require('spawn-command');
const config = require('./config');
const utils = require('../utils');

module.exports.hasHostProject = () => {
  let configObj = config.get();
  return !!(configObj.cli && configObj.cli.hostProject);
}

module.exports.runCommand = async (commandKey) => {
  let configObj = config.get();
  let hostProject = configObj.cli ? configObj.cli.hostProject : undefined;

  if(hostProject && hostProject.projectPath && hostProject[commandKey]) {
      return new Promise((resolve) => {
          let projectPath = utils.trimPath(hostProject.projectPath);
          let cmd = hostProject[commandKey];

          utils.log(`Running ${commandKey}: ${cmd}...`);

          const proc = spawnCommand(cmd, { stdio: 'inherit', cwd: projectPath});
          proc.on('exit', (code) => {
              utils.log(`hostproject: ${commandKey} completed with exit code: ${code}`);
              resolve();
          });
      });
  }
}

module.exports.runApp = async () => {
  let configObj = config.get();
  let hostProject = configObj.cli ? configObj.cli.hostProject : undefined;

  if (hostProject && hostProject.projectPath && hostProject.devCommand) {
      return new Promise((resolve) => {
          let projectPath = utils.trimPath(hostProject.projectPath);
          let cmd = hostProject.devCommand;

          utils.log(`Starting the host app: ${cmd} ...`);
          const proc = spawnCommand(cmd, { stdio: 'inherit', cwd: projectPath});
          proc.on('exit', (code) => {
              utils.log(`Host app stopped with exit code: ${code}`);
              resolve();
          });
      });
  } else {
    utils.error(`Missing host project configuration.`);
    process.exit(1);
  }
}
