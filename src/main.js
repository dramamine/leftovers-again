require('module-alias').addAlias('@la', __dirname);
const socket = require('./socket');
const monkey = require('./monkey');
const listener = require('./listener');
const defaults = require('./defaults');
const BotManager = require('./botmanager');
const BattleManager = require('./battlemanager');
const Spawner = require('./spawner');
const Interactive = require('./interfaces/cli');
const Challenger = require('./model/challenges');
const Lobby = require('./model/lobby');
const Log = require('./log');
const { MOVE, SWITCH } = require('./decisions');

let challenger;
let myconnection;
let lobby;

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
  if (challenger) challenger.cancelOutstandingChallenges();
  Spawner.kill();
  setTimeout(() => {
    if (myconnection) myconnection.close();
    if (options.exit) process.exit();
  }, 100);
}

/**
 * Show the help menu.
 */
function displayHelp() {
  console.log(`
Leftovers Again: interface for Pokemon Showdown bots

-bot [path]:     path to your bot class. REQUIRED.
-config [path]: specify a config file (ex. "./package.json")
-format:        specify a format for challenges (ex. "randombattle", "ou")
-h, --help:      show this menu
-ajax:           don't use this
-monkey:         listen to userscripts instead of connecting to a server
-matches [n]:  exit after n matches. default 0 means "don't exit"
-nickname [name]  login name (for Smogon official login server)
-password [pw]    account password (required for registered nicknames)
-loglevel [1-6]: level of severity of logs to show. higher levels are more
                 verbose. default 3. all server messages shown at 6.
-opponent [path]: Spawn a specific opponent via a child process.
-opponents [paths]: Spawn multiple opponents, ex. randumb,stabby,../anotherbot
-production:    Connect to Cyberdyne
-results [path]  Specify a path for results.csv (W-L records for your bots)
-scrappy:       Have your bot pick fights with anyone who's in the lobby or
                who joins the lobby.
-server [path]: Connect to a specific server.
-timeout [ms]:  Time out the bot after x milliseconds. (default 0, disabled)
`);
}

/**
 * argv: i.e., process.argv
 */
const start = (metadata, Bot) => {
  const info = new BotManager(metadata, Bot);

  // process cmdline args
  const args = require('minimist')(process.argv.slice(2));

  let config = {};
  if (args.config) {
    config = require(args.config);
  }

  if (args.help || args.h) {
    displayHelp();
    process.exit();
  }

  if (args.opponent) {
    Spawner.spawn(args.opponent);
    args.scrappy = true;
  } else if (args.opponents) {
    args.opponents.split(',').forEach((opponent) => {
      Spawner.spawn(opponent);
    });
    args.scrappy = true;
  }

  // for everything else, check args, then bot info, then defaults.
  // lots of these, you wouldn't really want them in bot info, but eh, whatever.
  const params = ['scrappy', 'format', 'nickname', 'password', 'server', 'matches',
    'production', 'prodServer', 'loglevel', 'results', 'test', 'timeout'];
  params.forEach((param) => {
    args[param] = args[param] || metadata[param] || config[param] || defaults[param];
  });

  // use prodServer if user had --production flag
  if (args.production) {
    if (args.scrappy) {
      Log.error('Come on! You can\'t challenge EVERYONE on the PRODUCTION server.');
      process.exit();
    }
    args.server = args.prodServer;
  }

  // connect to greasemonkey, or use websockets like a normal person
  if (args.monkey) {
    myconnection = monkey;
  } else {
    myconnection = socket;
  }

  if (args.loglevel) {
    Log.setLogLevel(args.loglevel);
  }

  lobby = new Lobby();
  // create some necessary classes
  challenger = new Challenger(myconnection, info, args);

  // battlemanager is going to create new battles as we learn about them.
  // for each one, it creates a new instance of a battle and of our AI class.
  // listener needs to know about the BattleManager to properly relay battle
  // messages to the right battle instance.
  const battlemanager = new BattleManager(info.BotClass, args.timeout);
  listener.use(battlemanager);

  // connect to a server, or create one and start listening.
  myconnection.connect(args);

  let interactive; // eslint-disable-line
  if (args.interactive || args.i) {
    interactive = new Interactive({
      challenger,
      lobby
    });
  }


  // do something when app is closing
  process.on('exit', exitHandler.bind(null, {
    cleanup: true
  }));

  // catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, {
    exit: true
  }));

  // catches uncaught exceptions
  process.on('uncaughtException', exitHandler.bind(null, {
    exit: true
  }));
};

module.exports = {
  start,
  MOVE,
  SWITCH
};
