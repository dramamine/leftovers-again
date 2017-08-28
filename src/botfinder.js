const Log = require('./log');

/**
 * Sets up important stuff like the bot location, class, and metadata.
 *
 * @param {String} path  The user-inputted path to the bot.
 */
const botFinder = (path) => {
  let Bot;
  const location = [
    path,
    './' + path,
    './bots/' + path,
    '../' + path,
    '../bots/' + path,
    '../../' + path,
  ].find((loc) => {
    Bot = tryRequire(loc);
    return !!Bot;
  });
  if (!location) {
    Log.error(`couldnt find path! trying to require ${path} from ${__dirname}`);
    process.exit();
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
      const bot = Bot.default ? new Bot.default() : new Bot(); // eslint-disable-line
      metadata = bot.meta;
    } catch (x) {
      Log.error('No metadata found! Expected to find the file in node_path '
        + path);
      Log.error(x);
    }
  }
  return {
    metadata,
    Bot
  };
};

/**
 * Try to require a thing.
 *
 * @param  {String} path The path to require
 * @return {Class}  The thing, undefined otherwise
 */
const tryRequire = (path) => {
  try {
    return require(path);
  } catch (e) {
    // suppress errors about not being able to find the path.
    if (!(e.message.includes('Cannot find module') && e.message.includes(path))) {
      Log.error(`Weird error when trying to require ${path}`);
      Log.error(e);
    }

    return undefined;
  }
};


module.exports = botFinder;
