const Log = require('./log');
const foreigner = require('./foreigner');

class BotManager {
  constructor(metadata, Bot) {
    if (metadata) {
      this.metadata = metadata;

      // note that this instance of the bot is created ONLY for pulling its team
      // string and metadata. this instance is not actually used in battles.
      if (Bot) {
        this.BotClass = Bot;

        this.bot = Bot.default ? new Bot.default() : new Bot(); // eslint-disable-line
      } else {
        Log.warn('No Bot class supplied!');
        Log.warn('If you\'re trying to write non-Javascript,');
        Log.warn('It\'s not supported yet!');

        this.BotClass = foreigner(metadata.script);
      }
    }
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
}

module.exports = BotManager;
