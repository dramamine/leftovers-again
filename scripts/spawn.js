const spawn = require('child_process').spawn;
import colors from 'colors/safe';

class Spawn {

  constructor() {
  }

  getServer() {
    const showdown = spawn('node', ['app.js'], {cwd: '../../server'});
    // const showdown = spawn('npm start', [], {cwd: '../../server'});

    showdown.stdout.on('data', (data) => {
      console.log(colors.cyan(data.toString().replace(/\n+$/, '')));
    });

    showdown.stderr.on('data', (data) => {
      console.log(colors.cyan.inverse(data));
    });

    showdown.on('close', (code) => {
      console.log(colors.cyan.underline('server process exited with code ' + code));
    });
  }

  getOpponents() {
    const op = spawn('babel-node', ['main.js', '--spawned' ], {cwd: '../src/'});
    // const showdown = spawn('npm start', [], {cwd: '../../server'});

    op.stdout.on('data', (data) => {
      console.log(colors.red(data.toString().replace(/\n+$/, '')));
    });

    op.stderr.on('data', (data) => {
      console.log(colors.red.inverse(data));
    });

    op.on('close', (code) => {
      console.log(colors.red.underline('server process exited with code ' + code));
    });
  }
}

export default Spawn;


const myspawn = new Spawn();
myspawn.getServer();
myspawn.getOpponents();
