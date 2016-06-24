'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Sets up important stuff like the bot location, class, and metadata.
 *
 * @param {String} path  The user-inputted path to the bot.
 */
var botFinder = function botFinder(path) {
  var Bot = void 0;
  var location = [path, './bots/' + path, '../bots/' + path].find(function (loc) {
    Bot = tryRequire(loc);
    if (Bot) return true;
  });
  if (!location) {
    _log2.default.error('couldnt find path! trying to require ' + path + ' from ' + __dirname);
    return {};
  }

  var metadata = void 0;

  // metadata location
  try {
    var pkg = location + '/package.json';
    metadata = require(pkg);
  } catch (e) {
    // nested try-catch, u mad brah?
    try {
      var bot = Bot.default ? new Bot.default() : new Bot();
      metadata = bot.meta;
    } catch (x) {
      _log2.default.error('No metadata found! Expected to find the file in node_path ' + path);
      _log2.default.error(x);
    }
  }
  return { metadata: metadata, Bot: Bot };
};

/**
 * Try to require a thing.
 *
 * @param  {String} path The path to require
 * @return {Class}  The thing, undefined otherwise
 */
var tryRequire = function tryRequire(path) {
  try {
    return require(path);
  } catch (e) {
    return undefined;
  }
};

exports.default = botFinder;