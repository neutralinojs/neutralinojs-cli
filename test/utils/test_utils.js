const utils = require("../../src/utils.js")
var expect = require('chai').expect
require('mocha-sinon')
const sinon = require('sinon');
const fs = require('fs');
const constants = require('../../src/constants');
const CONFIG_FILE = constants.files.configFile;


var assert = require('assert');
const { fstat } = require("fs");
describe('Test utils functions', function() {

  describe('Test log error', function() {
    it('should log error message when error() called', function(){
      const message = "sample"
      const stub = sinon.stub(console, 'error');
      utils.error(message);
      stub.restore();
      sinon.assert.calledOnce(stub);
      let arg = stub.getCall(0).args[0]
      assert.equal(arg.includes('neu:'), true)
    });
  });

  

  describe('Test is Neutralinojs Project', function() {
    const foldername = '.testtmp'
    const cwd = process.cwd()
    beforeEach(function(){
      fs.mkdirSync(foldername)
    })
    afterEach(function() {
      process.chdir(cwd)
      fs.rmSync('./'+foldername, {recursive: true});
    })
    it('a project without neutralino config file is not a neutralinojs project', function(){
      process.chdir(cwd+'/'+foldername)
      assert.equal(utils.isNeutralinojsProject(), false)
    })
    it('a project with neutralino config file is a neutralinojs project', function(){
      process.chdir(cwd+'/'+foldername)
      fs.writeFileSync('./'+CONFIG_FILE, '')
      assert.equal(utils.isNeutralinojsProject(), true)
    })
  })

  describe('Test check current Project', function() {
    const foldername = '.testtmp'
    const cwd = process.cwd()
    beforeEach(function(){
      fs.mkdirSync(foldername)
    })
    afterEach(function() {
      process.chdir(cwd)
      fs.rmSync('./'+foldername, {recursive: true});
    })
    it('error message and exit for a non-neutralinojs project', function(){
      try{
      process.chdir(cwd+'/'+foldername)
      const stub = sinon.stub(process, 'exit');
      const logstub = sinon.stub(console, 'error');
      utils.checkCurrentProject();
      assert(process.exit.calledOnce);
      sinon.assert.calledOnce(stub);
      stub.restore();
      logstub.restore();
      } catch(error) {
        console.error(error)
      }
    })
    it('no error message for a neutralinojs project', function(){
      process.chdir(cwd+'/'+foldername)
      fs.writeFileSync('./'+CONFIG_FILE, '')
      const stub = sinon.stub(console, 'error');
      utils.checkCurrentProject();
      stub.restore();
      sinon.assert.notCalled(stub);
    })
  })

  describe('Test util log', function() {
    it('console log message when log() called', function(){
      const message = "sample"
      const stub = sinon.stub(console, 'log');
      utils.log(message);
      stub.restore();
      sinon.assert.calledOnce(stub);
      let arg = stub.getCall(0).args[0]
      assert.equal(arg.includes('neu:'), true)
    });
  });

  describe('Test util warn', function() {
    it('console log warn message when warn() called', function(){
      const message = "sample"
      const stub = sinon.stub(console, 'warn');
      utils.warn(message);
      stub.restore();
      sinon.assert.calledOnce(stub);
      let arg = stub.getCall(0).args[0]
      assert.equal(arg.includes('neu:'), true)
    });
  });

  describe('Test trim path', function() {
    it('remove initial slash of string', function() {
      assert.equal(utils.trimPath('/a/b/c/'), 'a/b/c/')
    })
  })
});