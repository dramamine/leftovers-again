import Battle from 'battle';

let BotClass;

export default class BattleManager {
  constructor(botpath) {
    BotClass = require(botpath);
    this.battles = {};
  }
  find(id) {
    if (!this.battles[id]) {
      this.battles[id] = new Battle(id, new BotClass());
    }
    return this.battles[id];
  }
}
