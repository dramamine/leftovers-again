'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _battle = require('./battle');

var _battle2 = _interopRequireDefault(_battle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BotClass = void 0;

var BattleManager = function () {
  function BattleManager(Bot) {
    _classCallCheck(this, BattleManager);

    if (!Bot) {
      Log.error('BattleManager called with no bot! That is bad.');
    }
    BotClass = Bot;
    this.battles = {};
  }

  _createClass(BattleManager, [{
    key: 'find',
    value: function find(id) {
      if (!this.battles[id]) {
        var bot = BotClass.default ? new BotClass.default() : new BotClass();
        this.battles[id] = new _battle2.default(id, bot);
      }
      return this.battles[id];
    }
  }]);

  return BattleManager;
}();

exports.default = BattleManager;