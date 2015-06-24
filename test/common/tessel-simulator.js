var RemoteProcessSimulator = require('./remote-process-simulator');
var Tessel = require('../../lib/tessel/tessel');

function TesselSimulator() {
  var tessel = new Tessel();
  tessel._rps = new RemoteProcessSimulator();

  tessel.connection = {
    exec: function(command, callback) {
      if (!Array.isArray(command)) {
        throw new Error('Invalid command passed to exec.');
      }

      tessel._rps.control.write(command.join(' '));
      if (typeof callback === 'function') {
        callback(null, tessel._rps);
      }
    },
    end: function(callback) {
      if (typeof callback === 'function') {
        callback();
      }
    }
  };

  return tessel;
}

module.exports = TesselSimulator;
