const spawn = require('child_process').spawn;
import colors from 'colors/safe';
import glob from 'glob';
import inquirer from 'inquirer';


// @TODO need more? import from Pokemon-Showdown/config/formats.js
// you might want that for singles vs doubles and stuff too
const supportedFormats = ['ubers', 'ou', 'randombattle', 'anythinggoes'];
const children = [];

function getServer() {
  return new Promise( (resolve, reject) => {
    const showdown = spawn('node', ['app.js'], {cwd: './deps/Pokemon-Showdown'});
    let done = false;
    // const showdown = spawn('npm start', [], {cwd: '../../server'});

    showdown.stdout.on('data', (data) => {
      console.log(colors.cyan(data.toString().replace(/\n+$/, '')));
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
}

function loadMe(file) {
  console.log('spawning opponent from file ' + file);
  const botrootForMain = '--bot=' + file;
  const op = spawn('node', ['main.js', botrootForMain, '--spawned', ], {cwd: './lib/'});
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

  children.push(op);
}

getServer().then( () => {
  const folders = glob.sync('*/', {cwd: __dirname + '/../lib/bots/'});
  // console.log(folders);
  const validOptions = folders
    .map( (txt) => { return txt.replace('/', ''); })
    .filter( (txt) => { return supportedFormats.indexOf(txt) >= 0; });

  inquirer.prompt([
    {
      type: 'list',
      name: 'format',
      message: 'Which format would you like to run?',
      choices: validOptions
    }], (folder) => {
      // console.log(folder);
      const botfiles = glob.sync('**/*.js', {cwd: __dirname + '/../lib/bots/' + folder.format});
      // console.log(botfiles);
      const choices = botfiles.map( (txt) => { return { name: txt, checked: true }; });

      inquirer.prompt([
        {
          type: 'checkbox',
          name: 'files',
          message: 'Pick or un-pick any bots to run.',
          choices
        }], (bots) => {
          // console.log(bots.files);
          bots.files.forEach( (file) => {
            loadMe(folder.format + '/' + file);
          });
        }
      );
    }
  );
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
