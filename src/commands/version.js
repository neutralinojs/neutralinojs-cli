const utils = require('../utils');
const pkg = require('../../package.json');
const config = require('../modules/config');
const { getRemoteLatestVersion } = require('../modules/downloader');
const fs = require('fs');
const path = require('path');

function hasProject() {
  return utils.isNeutralinojsProject();
}

module.exports.register = (program) => {
  program
    .command('version')
    .description('displays global and project specific versions of packages')
    .option('--json', 'output version information as JSON')
    .option('--health', 'run environment and project health diagnostics')
    .action(async (command) => {
      const result = {
        cli: {
          version: pkg.version,
          latest: false
        },
        env: {
          node: process.version,
          platform: process.platform,
          arch: process.arch
        },
        project: {
          exists: false
        },
        status: 'ok'
      };

      const latestCli = await utils.checkLatestVersion();
      result.cli.latest = !!latestCli;

      let exitCode = 0;

      if (!result.cli.latest) {
        result.status = 'warning';
        exitCode = 1;
      }

      if (hasProject()) {
        const configObj = config.get();
        result.project.exists = true;
        result.project.name = configObj.cli.binaryName;
        result.project.applicationId = configObj.applicationId;

        const latestBinVersion = await getRemoteLatestVersion('neutralinojs');
        const latestLibVersion = await getRemoteLatestVersion('neutralino.js');

        const clientVersion = configObj.cli.clientVersion
          ? utils.getVersionTag(configObj.cli.clientVersion)
          : 'Installed from a package manager';

        const latestBin = configObj.cli.binaryVersion == latestBinVersion;
        const latestLib = configObj.cli.clientVersion
          ? (configObj.cli.clientVersion == latestLibVersion)
          : null;

        result.project.binary = {
          version: utils.getVersionTag(configObj.cli.binaryVersion),
          latest: latestBin
        };

        result.project.client = {
          version: clientVersion,
          latest: latestLib
        };

        if (!latestBin || latestLib === false) {
          result.status = 'warning';
          exitCode = 1;
        }

        const cfgPath = path.join(process.cwd(), 'neutralino.config.json');
        result.project.configExists = fs.existsSync(cfgPath);

        if (!result.project.configExists) {
          result.status = 'error';
          exitCode = 2;
        }

        if (configObj.version) {
          result.project.projectVersion = configObj.version;
        }
      } else {
        result.project.exists = false;
      }

      // JSON output (for --json or --health --json)
      if (command.json) {
        console.log(JSON.stringify(result, null, 2));
        process.exit(exitCode);
      }

      // HEALTH MODE (human readable)
      if (command.health) {
        utils.showArt();

        console.log(`✔ CLI installed: v${result.cli.version} ${result.cli.latest ? '(latest)' : '(outdated)'}`);
        console.log(`✔ Node.js: ${result.env.node}`);
        console.log(`✔ OS: ${result.env.platform} ${result.env.arch}\n`);

        if (!result.project.exists) {
          console.log('✖ No Neutralino project found in this directory.');
          console.log('hint: Run this inside a Neutralino project or create one using:\n  neu create my-app');
          process.exit(2);
        }

        console.log(`Project: ${result.project.name} (${result.project.applicationId})`);

        if (result.project.configExists) {
          console.log('✔ neutralino.config.json found');
        } else {
          console.log('✖ neutralino.config.json missing');
        }

        console.log(
          `${result.project.binary.latest ? '✔' : '✖'} Neutralino binaries: ${result.project.binary.version}` +
          `${result.project.binary.latest ? '' : ' (outdated)'}`
        );

        if (result.project.client.latest === null) {
          console.log(`✔ Client library: ${result.project.client.version}`);
        } else {
          console.log(
            `${result.project.client.latest ? '✔' : '✖'} Client library: ${result.project.client.version}` +
            `${result.project.client.latest ? '' : ' (outdated)'}`
          );
        }

        if (exitCode === 0) {
          console.log('\nStatus: healthy');
        } else if (exitCode === 1) {
          console.log('\nStatus: attention required');
          console.log("hint: Run `neu update --latest`");
        } else {
          console.log('\nStatus: broken');
        }

        process.exit(exitCode);
      }

      // EXISTING DEFAULT BEHAVIOR (unchanged)
      utils.showArt();
      console.log('--- Global ---');
      console.log(`neu CLI: v${pkg.version} ${result.cli.latest ? '(latest)' : ''}`);

      if (hasProject()) {
        const configObj = config.get();
        console.log(`\n--- Project: ${configObj.cli.binaryName} (${configObj.applicationId}) ---`);
        console.log(`Neutralinojs binaries: ${result.project.binary.version} ${result.project.binary.latest ? '(latest)' : ''}`);
        console.log(`Neutralinojs client: ${result.project.client.version} ${result.project.client.latest ? '(latest)' : ''}`);

        if (!result.project.binary.latest || result.project.client.latest === false) {
          utils.warn(
            `This project doesn't use the latest Neutralinojs framework. Run ` +
            `'neu update --latest' to download the latest framework binaries and the client library.`
          );
        }

        if (configObj.version) {
          console.log(`Project version: v${configObj.version}`);
        }
      } else {
        utils.log(
          `Run this command inside your project directory` +
          ` to get project specific Neutralinojs version.`
        );
      }
    });
};
