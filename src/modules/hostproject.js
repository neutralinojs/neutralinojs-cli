const path = require('path');
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
          let cmd = hostProject[commandKey];
          const validation = utils.validateProjectPath(hostProject.projectPath, '.');
          if (!validation.valid) {
              utils.error(validation.error);
              return resolve();
          }

          utils.log(`Running ${commandKey}: ${cmd}...`);

          const proc = spawnCommand(cmd, { stdio: 'inherit', cwd: validation.targetDir});
          proc.on('exit', (code) => {
              utils.log(`hostproject: ${commandKey} completed with exit code: ${code}`);
              resolve();
          });
      });
  }
}
