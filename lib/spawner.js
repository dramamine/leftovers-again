'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _child_process = require('child_process');

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Array of all spawned threads.
 * @type {Array}
 */
var children = [];

var Spawner = function () {
  function Spawner() {
    _classCallCheck(this, Spawner);
  }

  /**
   * Spawn a node instance that runs the given bot. Logs errors, but suppresses
   * stdout.
   *
   * @param  {[type]} path The bot path. This gets 'required' and is generally
   * expected to be in the 'bots' folder and not collide with any other
   * modules (other bots, or modules in src/).
   * @return {[type]}      [description]
   */


  _createClass(Spawner, [{
    key: 'spawn',
    value: function spawn(path) {
      _log2.default.log('spawning opponent with path ' + path);
      var op = (0, _child_process.spawn)('node', [__dirname + '/../lib/start', '' + path, '--loglevel=0'], {
        cwd: './'
      });
      // op.stdout.on('data', (data) => {
      //   console.log(data);
      // });
      // op.stderr.on('data', (data) => {
      //   Log.err('error from child process:');
      //   Log.err(data);
      // });

      op.on('close', function (code) {
        _log2.default.err('child process exited with code ' + code);
      });

      children.push(op);
    }

    // server() {
    //   let resolved = false;
    //   return new Promise((resolve, reject) => {
    //     console.log('spawning a server...');
    //     const op = spawn('node', [
    //       __dirname + '/../node_modules/pokemon-showdown'
    //     ], {
    //       cwd: __dirname + '/../node_modules/pokemon-showdown'
    //     });
    //     op.stdout.on('data', (msg) => {
    //       if (resolved) return;
    //       console.log(`${msg}`);
    //       if (msg.indexOf('Worker now listening on') === 0) {
    //         console.log('resolving...');
    //         // op.stdout.end();
    //         resolved = true;
    //         setTimeout(resolve, 1000);
    //       }
    //     });
    //     op.on('error', (err) => {
    //       console.log('Failed to start server. Maybe one was already running?');
    //       console.log(err);
    //       console.log('rejecting...');
    //       reject();
    //     });
    //     op.stderr.on('data', (err) => {
    //       console.error(`${err}`);
    //     });
    //     children.push(op);
    //   });
    // }

    /**
     * kill all your children...
     */

  }, {
    key: 'kill',
    value: function kill() {
      children.forEach(function (child) {
        if (child.stdin) child.stdin.pause();
        child.kill();
      });
    }
  }]);

  return Spawner;
}();

exports.default = new Spawner();