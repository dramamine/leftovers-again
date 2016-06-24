'use strict';

var _safe = require('colors/safe');

var _safe2 = _interopRequireDefault(_safe);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var spawn = require('child_process').spawn;


// @TODO need more? import from Pokemon-Showdown/config/formats.js
// you might want that for singles vs doubles and stuff too
var supportedFormats = ['ubers', 'ou', 'randombattle', 'anythinggoes'];
var children = [];

function getServer() {
  return new Promise(function (resolve, reject) {
    var showdown = spawn('node', ['app.js'], { cwd: './deps/Pokemon-Showdown' });
    var done = false;
    // const showdown = spawn('npm start', [], {cwd: '../../server'});

    showdown.stdout.on('data', function (data) {
      console.log(_safe2.default.cyan(data.toString().replace(/\n+$/, '')));
      if (data.toString().indexOf('Test your server at') === 0) {
        done = true;
        resolve(true);
      }
    });

    showdown.stderr.on('data', function (data) {
      console.log(_safe2.default.cyan.inverse(data));
    });

    showdown.on('close', function (code) {
      console.log(_safe2.default.cyan.underline('server process exited with code ' + code));
      if (!done) {
        reject(code);
      }
    });
    children.push(showdown);
  });
}

function loadMe(file) {
  console.log('spawning opponent from file ' + file);
  var botrootForMain = '--bot=' + file;
  var op = spawn('node', ['main.js', botrootForMain, '--spawned'], { cwd: './lib/' });
  // const showdown = spawn('npm start', [], {cwd: '../../server'});

  op.stdout.on('data', function (data) {
    console.log(_safe2.default.red(data.toString().replace(/\n+$/, '')));
  });

  op.stderr.on('data', function (data) {
    console.log(_safe2.default.red.inverse(data));
  });

  op.on('close', function (code) {
    console.log(_safe2.default.red.underline('server process exited with code ' + code));
  });

  children.push(op);
}

getServer().then(function () {
  var folders = _glob2.default.sync('*/', { cwd: __dirname + '/../lib/bots/' });
  // console.log(folders);
  var validOptions = folders.map(function (txt) {
    return txt.replace('/', '');
  }).filter(function (txt) {
    return supportedFormats.indexOf(txt) >= 0;
  });

  _inquirer2.default.prompt([{
    type: 'list',
    name: 'format',
    message: 'Which format would you like to run?',
    choices: validOptions
  }], function (folder) {
    // console.log(folder);
    var botfiles = _glob2.default.sync('**/*.js', { cwd: __dirname + '/../lib/bots/' + folder.format });
    // console.log(botfiles);
    var choices = botfiles.map(function (txt) {
      return { name: txt, checked: true };
    });

    _inquirer2.default.prompt([{
      type: 'checkbox',
      name: 'files',
      message: 'Pick or un-pick any bots to run.',
      choices: choices
    }], function (bots) {
      // console.log(bots.files);
      bots.files.forEach(function (file) {
        loadMe(folder.format + '/' + file);
      });
    });
  });
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
  children.forEach(function (child) {
    child.stdin.pause();
    child.kill();
  });
  if (options.exit) process.exit();
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));