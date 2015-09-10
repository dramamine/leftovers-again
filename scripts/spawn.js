const spawn = require('child_process').spawn;
import colors from 'colors/safe';
import glob from 'glob';

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

  loadMeAndMyChallengers(self, type = '.') {
    const botroot = __dirname + '/../src/bots/' + type + '/';
    console.log(botroot);
    glob('**/*.js', {cwd: botroot}, (err, files) => {
      console.log(files);
      files.map( (file) => {
        // TODO: check metadata if you want

        // reject self
        if (file.indexOf(self) === 0) return;
        console.log('spawning opponent from file ' + file);

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
      });
    });
  }
}

export default Spawn;


const myspawn = new Spawn();
// myspawn.getServer();
const self = 'martenbot.js';
const type = 'randombattle';
myspawn.loadMeAndMyChallengers(self, type);
