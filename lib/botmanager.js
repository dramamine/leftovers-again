'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _foreigner = require('./foreigner');

var _foreigner2 = _interopRequireDefault(_foreigner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BotManager = function () {
  function BotManager(metadata, Bot) {
    _classCallCheck(this, BotManager);

    if (metadata) {
      this.metadata = metadata;

      // note that this instance of the bot is created ONLY for pulling its team
      // string and metadata. this instance is not actually used in battles.
      if (Bot) {
        this.BotClass = Bot;

        this.bot = Bot.default ? new Bot.default() : new Bot(); // eslint-disable-line
      } else {
          _log2.default.warn('No Bot class supplied!');
          _log2.default.warn('If you\'re trying to write non-Javascript,');
          _log2.default.warn('It\'s not supported yet!');

          this.BotClass = (0, _foreigner2.default)(metadata.script);
        }
    }
  }

  _createClass(BotManager, [{
    key: 'team',

    /**
     * Either the bot has
     * @return {[type]} [description]
     */
    value: function team(opponent) {
      if (this.bot.team && typeof this.bot.team === 'function') {
        return this.bot.team(opponent);
      } else if (this.metadata && this.metadata.team) {
        return this.metadata.team;
      }
      return '';
    }
  }, {
    key: 'version',
    get: function get() {
      return this.metadata.version;
    }
  }, {
    key: 'format',
    get: function get() {
      return this.metadata.format;
    }
  }, {
    key: 'nickname',
    get: function get() {
      return this.metadata.nickname;
    }
  }, {
    key: 'password',
    get: function get() {
      return this.metadata.password;
    }
  }, {
    key: 'accepts',
    get: function get() {
      return this.metadata.accepts;
    }
  }]);

  return BotManager;
}();

exports.default = BotManager;