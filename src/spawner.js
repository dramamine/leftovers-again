const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const Log = require('./log');

/**
 * Array of all spawned threads.
 * @type {Array}
 */
const children = [];

class Spawner {
  /**
   * Spawn a node instance that runs the given bot. Logs errors, but suppresses
   * stdout.
   *
   * @param  {[type]} path The bot path. This gets 'required' and is generally
   * expected to be in the 'bots' folder and not collide with any other
   * modules (other bots, or modules in src/).
   * @return {[type]}      [description]
   */
  spawn(botpath) {
    Log.warn(`spawning opponent with path ${botpath}`);

    // start script
    const locations = [
      path.join(__dirname, '../src/app.js'),
      'node_modules/leftovers-again/src/app.js'
    ];

    let stat;
    const script = locations.find((location) => {
      try {
        stat = fs.statSync(location);
        return stat.isFile();
      } catch (e) {
        return false;
      }
    });

    if (!script) {
      Log.error(`Couldn't find app.js script, which is needed to spawn new instances.
I looked here: ${locations}`);
    }

    const op = spawn('node', [script,
      `${botpath}`, '--loglevel=5'
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
      Log.err(`child process for ${botpath} exited with code ${code}`);
      Log.err('We shouldn\'t go on if our opponent is gone.');
      process.exit();
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
  kill() {
    children.forEach((child) => {
      if (child.stdin) child.stdin.pause();
      child.kill();
    });
  }
}

module.exports = new Spawner();
