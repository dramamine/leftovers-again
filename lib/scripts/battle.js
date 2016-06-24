'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _safe = require('colors/safe');

var _safe2 = _interopRequireDefault(_safe);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var spawn = require('child_process').spawn;
var readline = require('readline');


var args = require('minimist')(process.argv.slice(2));

var _args$_ = _slicedToArray(args._, 2);

var self = _args$_[0];
var opponent = _args$_[1];

var loglevel = args.loglevel || 1;
var children = [];

var getServer = function getServer() {
  return new Promise(function (resolve, reject) {
    var showdown = spawn('node', ['app.js'], { cwd: './lib/Pokemon-Showdown' });
    var done = false;
    // const showdown = spawn('npm start', [], {cwd: '../../server'});

    showdown.stdout.on('data', function (data) {
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
};

var loadSelf = function loadSelf(path) {
  console.log('spawning self from file ' + path);
  var op = spawn('babel-node', ['src/main.js', '--bot=' + path, '--loglevel=' + loglevel, '--scrappy'], {
    cwd: './'
  });

  readline.createInterface({
    input: op.stdout,
    terminal: false
  }).on('line', function (line) {
    console.log(line);
  });

  // op.stdout.on('data', (data) => {
  //   console.log(data.toString().replace(/\n+$/, ''));
  // });

  op.stderr.on('data', function (data) {
    console.err(data);
  });

  op.on('close', function (code) {
    console.log(_safe2.default.red.underline('server process exited with code ' + code));
  });

  children.push(op);
};

var loadOpponent = function loadOpponent(path) {
  console.log('spawning opponent from file ' + path);
  var op = spawn('babel-node', ['src/main.js', '--bot=' + path, '--scrappy'], {
    cwd: './'
  });
  children.push(op);
};

getServer().then(function () {
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