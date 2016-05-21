'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _child_process = require('child_process');

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Array of all spawned threads.
 * @type {Array}
 */
const children = [];

class Spawner {
  constructor() {}

  /**
   * Spawn a node instance that runs the given bot. Logs errors, but suppresses
   * stdout.
   *
   * @param  {[type]} path The bot path. This gets 'required' and is generally
   * expected to be in the 'bots' folder and not collide with any other
   * modules (other bots, or modules in src/).
   * @return {[type]}      [description]
   */
  spawn(path) {
    _log2.default.log('spawning opponent with path ' + path);
    const op = (0, _child_process.fork)('./lib/start', [`${ path }`, '--loglevel=0'], {
      cwd: './'
    });
    // op.stdout.on('data', (data) => {
    //   console.log(data);
    // });
    // op.stderr.on('data', (data) => {
    //   Log.err('error from child process:');
    //   Log.err(data);
    // });

    op.on('close', code => {
      _log2.default.err('child process exited with code ' + code);
    });

    children.push(op);
  }

  /**
   * kill all your children...
   */
  kill() {
    children.forEach(child => {
      child.stdin.pause();
      child.kill();
    });
  }
}

exports.default = new Spawner();