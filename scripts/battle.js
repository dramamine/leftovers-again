const spawn = require('child_process').spawn;
const readline = require('readline');
import colors from 'colors/safe';

const args = require('minimist')(process.argv.slice(2));
const [self, opponent] = args._;
const loglevel = args.loglevel || 1;
const children = [];

const getServer = () => {
  return new Promise( (resolve, reject) => {
    const showdown = spawn('node', ['app.js'], {cwd: './lib/Pokemon-Showdown'});
    let done = false;
    // const showdown = spawn('npm start', [], {cwd: '../../server'});

    showdown.stdout.on('data', (data) => {
      if (data.toString().indexOf('Test your server at') === 0) {
        done = true;
        resolve(true);
      }
    });

    showdown.stderr.on('data', (data) => {
      console.log(colors.cyan.inverse(data));
    });

    showdown.on('close', (code) => {
      console.log(colors.cyan.underline('server process exited with code ' + code));
      if (!done) {
        reject(code);
      }
    });
    children.push(showdown);
  });
};


const loadSelf = (path) => {
  console.log('spawning self from file ' + path);
  const op = spawn('babel-node', [
    'src/main.js',
    `--bot=${path}`,
    `--loglevel=${loglevel}`,
    '--scrappy'
  ], {
    cwd: './'
  });

  readline.createInterface({
    input: op.stdout,
    terminal: false
  }).on('line', (line) => {
    console.log(line);
  });

  // op.stdout.on('data', (data) => {
  //   console.log(data.toString().replace(/\n+$/, ''));
  // });

  op.stderr.on('data', (data) => {
    console.err(data);
  });

  op.on('close', (code) => {
    console.log(colors.red.underline('server process exited with code ' + code));
  });

  children.push(op);
};

const loadOpponent = (path) => {
  console.log('spawning opponent from file ' + path);
  const op = spawn('babel-node', [
    'src/main.js',
    `--bot=${path}`,
    '--scrappy'
  ], {
    cwd: './'
  });
  children.push(op);
};

getServer().then( () => {
  loadSelf(self);

  loadOpponent(opponent);
});


/**
 * This is kind of crappy, but this helps out with testing. When you're using
 * nodemon for 'livereload'-ish functionality, you want to close your connection
 * before you do anything.
 *
 * @param  {[type]} options [description]
 * @param  {[type]} err     [description]
 * @return {[type]}         [description]
 */
function exitHandler(options, err) {
  if (err) console.log(err.stack);
  children.forEach( (child) => {
    child.stdin.pause();
    child.kill();
  });
  if (options.exit) process.exit();
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, {cleanup: true}));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit: true}));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));
