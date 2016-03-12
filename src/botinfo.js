import Log from 'log';
class BotInfo {
  constructor(path) {
    this.path = path;
    this.metadata = {};

    // note that this instance of the bot is created ONLY for pulling its team
    // string and metadata. this instance is not actually used in battles.
    this.bot = null;

    // metadata location
    try {
      const pkg = path + '/package.json';
      this.metadata = require(pkg);
    } catch (e) {
      // nested try-catch, u mad brah?
      try {
        // just load the bot and hope it has all these metadata functions
        const It = require(path);
        this.bot = new It();
      } catch (x) {
        Log.error('No metadata found! Expected to find the file in node_path '
         + path);
      }
    }
  }

  get version() {
    return this.bot.meta.version;
  }

  get format() {
    return this.bot.meta.format;
  }
  get accepts() {
    return this.bot.meta.accepts;
  }
  /**
   * Either the bot has
   * @return {[type]} [description]
   */
  team(opponent) {
    if (this.bot.team && typeof this.bot.team === 'function') {
      return this.bot.team(opponent);
    }
    return this.bot.meta.team;
  }
}

export default BotInfo;
