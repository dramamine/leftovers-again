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
const botFinder = path => {
  let location;
  let botClass;
  try {
    location = path;
    botClass = require(location);
  } catch (e) {
    try {
      location = './bots/' + path;
      botClass = require(location);
    } catch (e) {
      // eslint-disable-line
      _log2.default.error('couldnt find path! trying to require ' + __dirname + ' ' + path);
    }
  }
  if (!botClass) {
    return {};
  }

  let metadata;

  // metadata location
  try {
    const pkg = location + '/package.json';
    metadata = require(pkg);
  } catch (e) {
    // nested try-catch, u mad brah?
    try {
      console.log('trying to make a bot.');
      const bot = new botClass.default();
      metadata = bot.meta;
    } catch (x) {
      _log2.default.error('No metadata found! Expected to find the file in node_path ' + path);
      _log2.default.error(x);
    }
  }
  return { botClass, metadata };
};

exports.default = botFinder;