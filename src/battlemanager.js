import Battle from './battle';

let BotClass;

export default class BattleManager {
  constructor(botClass) {
    BotClass = botClass;
    this.battles = {};
  }
  find(id) {
    if (!this.battles[id]) {
      this.battles[id] = new Battle(id, new BotClass.default());
    }
    return this.battles[id];
  }
}
