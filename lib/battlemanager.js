'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _battle = require('./battle');

var _battle2 = _interopRequireDefault(_battle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let BotClass;

class BattleManager {
  constructor(botClass) {
    BotClass = botClass;
    this.battles = {};
  }
  find(id) {
    if (!this.battles[id]) {
      this.battles[id] = new _battle2.default(id, new BotClass.default());
    }
    return this.battles[id];
  }
}
exports.default = BattleManager;