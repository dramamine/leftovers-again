const spawn = require('child_process').spawn;
import colors from 'colors/safe';
import glob from 'glob';

class Spawn {

  constructor() {
  }

  getServer() {
    return new Promise( (resolve, reject) => {
      const showdown = spawn('node', ['app.js'], {cwd: './lib/Pokemon-Showdown'});
      let done = false;
      // const showdown = spawn('npm start', [], {cwd: '../../server'});

      showdown.stdout.on('data', (data) => {
        console.log(colors.cyan(data.toString().replace(/\n+$/, '')));
        if (data.toString().indexOf('now listening on') > 0) {
          done = true;
          resolve(true);
        }
      });

      showdown.stderr.on('data', (data) => {
        console.log(colors.cyan.inverse(data));

      });

      showdown.on('close', (code) => {
        console.log(colors.cyan.underline('server process exited with code ' + code));
        if(!done) {
          reject(code);
        }
      });

    });
  }

  loadMeAndMyChallengers(self, type = '.') {
    const botroot = __dirname + '/../src/bots/' + type + '/';
    console.log(botroot);
    glob('**/*.js', {cwd: botroot}, (err, files) => {
      console.log(files);
      files.map( (file) => {
        // reject self
        if (file === self) return;
        console.log('spawning opponent from file ' + file);
        const botrootForMain = 'bot=' + type + '/' + file;
        const op = spawn('babel-node', ['main.js', '--spawned', botrootForMain ], {cwd: './src/'});
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
const self = 'stabby.js';
const type = 'randombattle';
myspawn.getServer().then( () => {
  console.log('loading challengers...');
  myspawn.loadMeAndMyChallengers(self, type);
});
