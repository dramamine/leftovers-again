import Log from './log';
import Foreigner from './foreigner';

class BotManager {
  constructor(metadata, botClass) {
    if (metadata) {
      this.metadata = metadata;

      // note that this instance of the bot is created ONLY for pulling its team
      // string and metadata. this instance is not actually used in battles.
      if (botClass) {
        this.botClass = botClass;
        this.bot = new this.botClass();
      } else {
        Log.warn('No botClass supplied!');
        Log.warn('If you\'re trying to write non-Javascript,');
        Log.warn('It\'s not supported yet!');

        this.botClass = Foreigner(metadata.script);
      }
    }
  }

  use(path) {
    Log.info('trying to require path:' + path);
    this.find(path);
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
  find(path) {
    let location;
    let It;
    try {
      location = path;
      It = require(location);
    } catch (e) {
      try {
        location = './bots/' + path;
        It = require(location);
      } catch (e) {
        try {
          location = '../../../'; // current directory?
          It = require(location);
        } catch (e) {
          Log.error('couldnt find path! trying to require ' + path);
        }
      }
    }
    if (!It) {
      return;
    }
    this.botClass = It;
    this.bot = new It.default();  // eslint-disable-line

    // metadata location
    try {
      const pkg = location + '/package.json';
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

}

export default BotManager;
