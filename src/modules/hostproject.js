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
      return new Promise((resolve,reject) => {
          let projectPath = utils.trimPath(hostProject.projectPath);
          let cmd = hostProject[commandKey];

          utils.log(`Running ${commandKey}: ${cmd}...`);
          const proc = spawnCommand(cmd, { stdio: 'inherit', cwd: projectPath});
          proc.on('error', (err) => {
              utils.error(`hostproject: ${commandKey} failed to start: ${err.message}`);
              reject(err);
          });
          proc.on('exit', (code, signal) => {
              if(code || signal) {
                  let reason = signal ? `terminated by signal: ${signal}` : `failed with exit code: ${code}`;
                  utils.error(`hostproject: ${commandKey} ${reason}`);
                  return reject(new Error(`hostproject: ${commandKey} ${reason}`));
              }
              utils.log(`hostproject: ${commandKey} completed successfully`);
              resolve();
          });
      });
  }
}