'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _battle = require('./battle');

var _battle2 = _interopRequireDefault(_battle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let BotClass;

class BattleManager {
  constructor(Bot) {
    console.log('battle manager: ', Bot);
    if (!Bot) {
      Log.error('BattleManager called with no bot! That is bad.');
    }
    BotClass = Bot;
    this.battles = {};
  }
  find(id) {
    if (!this.battles[id]) {
      const bot = BotClass.default ? new BotClass.default() : new BotClass();
      this.battles[id] = new _battle2.default(id, bot);
    }
    return this.battles[id];
  }
}
exports.default = BattleManager;