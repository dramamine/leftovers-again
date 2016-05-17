import Log from './log';
class BotInfo {
  constructor(metadata, factory) {
    this.metadata = metadata;

    // note that this instance of the bot is created ONLY for pulling its team
    // string and metadata. this instance is not actually used in battles.
    this.find(factory);
  }

  get version() {
    return this.metadata.version;
  }

  get format() {
    return this.metadata.format;
  }

  get nickname() {
    return this.metadata.nickname;
  }

  get password() {
    return this.metadata.password;
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

  /**
   * Sets up important stuff like the bot location, class, and metadata.
   *
   * @param {String} path  The user-inputted path to the bot.
   */
  find(botClass) {
    // console.log('finding this...', botClass);
    this.botClass = botClass;
    this.bot = new this.botClass();

    // // metadata location
    // try {
    //   const pkg = './package.json';
    //   console.log('searchin 4 metadata');
    //   this.metadata = require(pkg);
    //   console.log(this.metadata);
    // } catch (e) {
    //   console.log(e);
    //   // nested try-catch, u mad brah?
    //   try {
    //     this.metadata = this.bot.meta;
    //   } catch (x) {
    //     Log.error('No metadata found! Expected to find the file in node_path '
    //      + path);
    //   }
    // }
  }
}

export default BotInfo;
