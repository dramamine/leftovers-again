import Log from './log';

  /**
   * Sets up important stuff like the bot location, class, and metadata.
   *
   * @param {String} path  The user-inputted path to the bot.
   */
const botFinder = (path) => {
  console.log('botFinder called.');
  console.log('trying path ', path);
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
      try {
        location = '../../../'; // current directory?
        botClass = require(location);
      } catch (e) {
        Log.error('couldnt find path! trying to require ' + path);
      }
    }
  }
  if (!botClass) {
    return;
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
      Log.error('No metadata found! Expected to find the file in node_path '
       + path);
      Log.error(x);
    }
  };
  return {botClass, metadata};
};

export default botFinder;
