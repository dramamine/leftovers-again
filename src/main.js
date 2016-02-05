// @TODO move these to 'connection' and maybe don't load them all
import socket from 'socket';
import monkey from 'monkey';
import listener from 'listener';
import Challenger from 'challenger';
import Chat from 'chat';
import config from 'config';
import BotInfo from 'botinfo';
import BattleManager from 'battlemanager';

// process cmdline args
const args = require('minimist')(process.argv.slice(2));

if (args.help || args.h) {
  _displayHelp();
  process.exit();
}

let myconnection;
if (args.monkey) {
  myconnection = monkey;
} else {
  myconnection = socket;
}

// connect to a server, or create one and start listening.
myconnection.connect(args);

const botpath = args.bot || config.bot;
const scrappy = args.scrappy || config.scrappy;
const matches = args.matches || config.matches;

const chat = new Chat();

const challenger = new Challenger(myconnection, new BotInfo(botpath), scrappy,
  matches);

// battlemanager is going to create new battles as we learn about them.
// for each one, it creates a new instance of a battle and of our AI class.
// listener needs to know about the BattleManager to properly relay battle
// messages to the right battle instance.
const battlemanager = new BattleManager(botpath);
listener.use(battlemanager);

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

/**
 * Show the help menu.
 */
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
