import Battle from './battle';
import Log from './log';

let BotClass;

export default class BattleManager {
  constructor(Bot) {
    if (!Bot) {
      Log.error('BattleManager called with no bot! That is bad.');
    }
    BotClass = Bot;
    this.battles = {};
  }
  find(id) {
    if (!this.battles[id]) {
      const bot = BotClass.default ? new BotClass.default() : new BotClass(); // eslint-disable-line
      this.battles[id] = new Battle(id, bot);
    }
    return this.battles[id];
  }
}
