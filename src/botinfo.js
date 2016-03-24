import Log from 'log';
class BotInfo {
  constructor(path) {
    this.path = path;
    this.metadata = {};

    // note that this instance of the bot is created ONLY for pulling its team
    // string and metadata. this instance is not actually used in battles.
    const It = require(path);
    Log.info('trying to load path:', path, It);
    this.bot = new It.default();

    // metadata location
    try {
      const pkg = path + '/package.json';
      this.metadata = require(pkg);
    } catch (e) {
      // nested try-catch, u mad brah?
      try {
        this.metadata = this.bot.meta;
      } catch (x) {
        Log.error('No metadata found! Expected to find the file in node_path '
         + path);
      }
    }
  }

  get version() {
    return this.metadata.version;
  }

  get format() {
    return this.metadata.format;
  }
  get accepts() {
    return this.metadata.accepts;
  }
  /**
   * Either the bot has
   * @return {[type]} [description]
   */
  team(opponent) {
    if (this.bot.team && typeof this.bot.team === 'function') {
      return this.bot.team(opponent);
    } else if (this.metadata && this.metadata.team) {
      return this.metadata.team;
    }
    return '';
  }
}

export default BotInfo;
