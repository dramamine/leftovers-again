import {fork} from 'child_process';
import Log from './log';

/**
 * Array of all spawned threads.
 * @type {Array}
 */
const children = [];

class Spawner {
  constructor() {

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
  spawn(path) {
    Log.log('spawning opponent with path ' + path);
    const op = fork('./lib/start', [
      `${path}`, '--loglevel=0'
    ], {
      cwd: './'
    });
    // op.stdout.on('data', (data) => {
    //   console.log(data);
    // });
    // op.stderr.on('data', (data) => {
    //   Log.err('error from child process:');
    //   Log.err(data);
    // });

    op.on('close', (code) => {
      Log.err('child process exited with code ' + code);
    });

    children.push(op);
  }

  /**
   * kill all your children...
   */
  kill() {
    children.forEach( (child) => {
      child.stdin.pause();
      child.kill();
    });
  }
}

export default new Spawner();
