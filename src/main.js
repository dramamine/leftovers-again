// load all the modules we need
require('./chat');
require('./listener');
import socket from './socket';
import ajax from './ajax';
import config from './config';

const argv = require('minimist')(process.argv.slice(2));
if (argv.bot) {
  console.log('good, loading my bot.');
  config.botPath = argv.bot;
}

if (argv.ajax) {
  console.log('using an ajax connection.');
  ajax.connect();
  // sending my own insecure messages
}

socket.connect();

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
  if (options.cleanup) console.log('clean');
  if (err) console.log(err.stack);
  socket.close();
  ajax.close();
  if (options.exit) process.exit();
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, {cleanup: true}));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit: true}));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));
