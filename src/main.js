// @TODO not sure if we really need to require this
require('./listener');

import config from './config';

// @TODO move these to 'connection' and maybe don't load them all
import socket from './socket';
import ajax from './ajax';
import monkey from './monkey';

// process cmdline args
const argv = require('minimist')(process.argv.slice(2));

if (argv.help || argv.h) {
  _displayHelp();
  process.exit();
}
if (argv.bot) {
  console.log('good, loading my bot.');
  config.botPath = argv.bot;
}
let myconnection;
if (argv.ajax) {
  myconnection = ajax;
} else if (argv.monkey) {
  myconnection = monkey;
} else {
  myconnection = socket;
}

// connect to a server, or create one and start listening.
myconnection.connect();

/**
 * This is kind of crappy, but this helps out with testing. When you're using
 * nodemon for 'livereload'-ish functionality, you want to close your connection
 * before you do anything.
 *
 * @param  {Object} options Options object with these properties:
 *                          cleanup: run cleanup task
 *                          exit: exit the process after you're done
 * @param  {Object} err     The JS error message if there is one.
 *
 */
function exitHandler(options, err) {
  if (options.cleanup) console.log('clean');
  if (err) console.log(err.stack);
  myconnection.close();
  if (options.exit) process.exit();
}

function _displayHelp() {
  console.log(`
Leftovers Again: interface for Pokemon Showdown bots

-bot [path]:     path to your bot class. REQUIRED.
-h, --help:      show this menu
-ajax:           don't use this
-monkey:         listen to userscripts instead of connecting to a server
-loglevel [1-5]: level of severity of logs to show. higher levels are more
                 verbose. default 3.
`);
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, {cleanup: true}));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit: true}));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));
