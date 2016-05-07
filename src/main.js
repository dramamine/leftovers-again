import socket from 'socket';
import monkey from 'monkey';
import listener from 'listener';
import Challenger from 'challenger';
import defaults from 'defaults';
import BotInfo from 'botinfo';
import BattleManager from 'battlemanager';
import Spawner from 'spawner';

// process cmdline args
const args = require('minimist')(process.argv.slice(2));

if (args.help || args.h) {
  _displayHelp();
  process.exit();
}

if (args.opponent) {
  Spawner.spawn(args.opponent);
  // auto-set scrappy
  args.scrappy = true;
}

let myconnection;
if (args.monkey) {
  myconnection = monkey;
} else {
  myconnection = socket;
}


const firstArg = (args._ && args._[0]) ? args._[0] : null;
const botpath = args.bot || firstArg || defaults.bot;

const scrappy = args.scrappy || defaults.scrappy;
// the battle format if we issue challenges.
// if you're not using cmdline: this lives in the bot's defaults, not defaults.js
const format = args.format;
const matches = args.matches || defaults.matches;

const info = new BotInfo(botpath);
args.nickname = info.nickname || args.nickname || defaults.nickname;
args.password = info.password || args.password || defaults.password;

// create some necessary classes
const challenger = new Challenger(myconnection, info, scrappy,
  format, matches);

// battlemanager is going to create new battles as we learn about them.
// for each one, it creates a new instance of a battle and of our AI class.
// listener needs to know about the BattleManager to properly relay battle
// messages to the right battle instance.
const battlemanager = new BattleManager(botpath);
listener.use(battlemanager);


// connect to a server, or create one and start listening.
myconnection.connect(args);

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
  if (err) console.error(err.stack);
  challenger.cancelOutstandingChallenges();
  setTimeout(() => {
    myconnection.close();
    if (options.exit) process.exit();
  }, 100);
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
-opponent [path]: Spawn a specific opponent via a child process.
-scrappy:       Have your bot pick fights with anyone who's in the lobby or
                 who joins the lobby.
`);
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, {cleanup: true}));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit: true}));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));
