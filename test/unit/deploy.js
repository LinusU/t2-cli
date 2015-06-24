var sinon = require('sinon');
var Tessel = require('../../lib/tessel/tessel');
var commands = require('../../lib/tessel/commands');
var logs = require('../../lib/logs');
var controller = require('../../lib/controller');
var TesselSimulator = require('../common/tessel-simulator')
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var deployFolder = path.join(__dirname, 'tmp');
var deployFile = path.join(deployFolder, 'app.js')
var codeContents = 'console.log("testing deploy");';
var rimraf = require('rimraf');

exports['Tessel.prototype.deployScript'] = {
  setUp: function(done) {
  
    this.deployScript = sinon.spy(Tessel.prototype, 'deployScript');
    this.stopRunningScript = sinon.spy(commands, 'stopRunningScript');
    this.deleteFolder = sinon.spy(commands, 'deleteFolder');
    this.createFolder = sinon.spy(commands, 'createFolder');
    this.untarStdin = sinon.spy(commands, 'untarStdin');
    this.runScript = sinon.spy(commands, 'runScript');
    this.openStdinToFile = sinon.spy(commands, 'openStdinToFile');
    this.setExecutablePermissions = sinon.spy(commands, 'setExecutablePermissions');
    this.startPushedScript = sinon.spy(commands, 'startPushedScript');

    this.logsWarn = sinon.stub(logs, 'warn', function() {});
    this.logsInfo = sinon.stub(logs, 'info', function() {});

    this.tessel = TesselSimulator();

    deleteTemporaryDeployCode()
    .then(done)
  },

  tearDown: function(done) {
    this.tessel.close();
    this.deployScript.restore();
    this.stopRunningScript.restore();
    this.deleteFolder.restore();
    this.createFolder.restore();
    this.untarStdin.restore();
    this.runScript.restore();
    this.openStdinToFile.restore();
    this.setExecutablePermissions.restore();
    this.startPushedScript.restore();
    this.logsWarn.restore();
    this.logsInfo.restore();
    deleteTemporaryDeployCode()
    .then(done)
    .catch(function(err) {
      throw err;
    })
  },

  runScript: function(test) {
    var self = this;

    createTemporaryDeployCode()
    .then(function deploy() {

      self.tessel._rps.on('newListener', function(event) {
        if (event === 'close') {
          setImmediate(function() {
            self.tessel._rps.emit('close');
          });
        }
      })

      self.tessel.deployScript({entryPoint: path.relative(process.cwd(), deployFile)}, false)
      .then(function success() {
        test.done();
      })
      .catch(function fail(err) {
        reject("Unable to run a perfectly valid test.");
      })
    })
  },

  // pushScript: function(test) {
    
  // }
}
function createTemporaryDeployCode() {
  return new Promise(function(resolve, reject) {  
    mkdirp(deployFolder, function(err) {
      if (err) {
        return reject(err);
      }
      else {
        fs.writeFile(deployFile, codeContents, function(err) {
          if (err) {
            reject(err);
          }
          else {
            resolve();
          }
        });
      }
    });
  });
}

function deleteTemporaryDeployCode() {
  return new Promise(function(resolve, reject) {
    rimraf(deployFolder, function(err) {
      if (err) {
        reject(err);
      }
      else {
        resolve();
      }
    });
  });
}