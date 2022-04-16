const creator = require('../../src/modules/creator');
require('mocha-sinon')
const sinon = require('sinon');
const fs = require('fs');
const utils = require('../../src/utils.js')

var assert = require('assert');
const { exit } = require('process');
describe('Test create command', function() {
  const foldername = '.testtmp';
  const cwd = process.cwd()
  

  describe('Test create with existing folder name', function() {
    beforeEach(function(){
      fs.mkdirSync(foldername);
      process.chdir(cwd+'/'+foldername);
    })
    afterEach(function() {
      process.chdir(cwd);
      fs.rmSync('./'+foldername, {recursive: true});
      // exit(1);
    })
    it('should log error and exit', async function(){
      const projectName = 'project'
      fs.mkdirSync(projectName)
      const stub = sinon.stub(process, 'exit');
      const logstub = sinon.stub(console, 'error');
      await creator.createApp(projectName);
      assert(process.exit.calledOnce);
      sinon.assert.calledOnce(stub);
      stub.restore();
      logstub.restore();
      
    });

    it('should download default without template arg', async function(){
      const projectName = 'project'
      await creator.createApp(projectName);
      process.chdir(cwd+'/'+foldername+'/'+projectName)
      assert(utils.isNeutralinojsProject())
    });

    it('should able to download with a template arg', async function(){
      const projectName = 'project'
      await creator.createApp(projectName, 'neutralinojs/neutralinojs-minimal');
      process.chdir(cwd+'/'+foldername+'/'+projectName)
      assert(utils.isNeutralinojsProject())
    });
  });
});