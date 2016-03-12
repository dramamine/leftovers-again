const spawn = require('child_process').spawn;
import Log from 'log';

const children = [];

class Spawner {
  constructor() {

  }

  spawn(path) {
    Log.notice('spawning opponent with path ' + path);
    const op = spawn('babel-node', [
      'src/main.js',
      `--bot=${path}`
    ], {
      cwd: './'
    });
    op.stderr.on('data', (data) => {
      Log.err('error from child process:');
      Log.err(data);
    });

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
