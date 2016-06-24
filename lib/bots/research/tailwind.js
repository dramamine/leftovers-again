'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ai = require('../../ai');

var _ai2 = _interopRequireDefault(_ai);

var _decisions = require('../../decisions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Summon Talonflames to cast 'Roost' over and over.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * npm run develop -- --bot=anythinggoes/tester/rooster.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var moveId = 'roost';

var Rooster = function (_AI) {
  _inherits(Rooster, _AI);

  function Rooster() {
    _classCallCheck(this, Rooster);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Rooster).call(this));

    _this.meta = {
      accepts: 'anythinggoes',
      format: 'anythinggoes',
      nickname: 'Tailwind ★marten★'
    };

    _this.ctr = -1;
    return _this;
  }

  _createClass(Rooster, [{
    key: 'team',
    value: function team() {
      return '\nTalonflame\nAbility: Gale Wings\nLevel: 100\nEVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe\nSerious Nature\n- Tailwind\n- Agility\n- Brave Bird\n- Roost\n\nTalonflame\nAbility: Gale Wings\nLevel: 100\nEVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe\nSerious Nature\n- Tailwind\n- Agility\n- Brave Bird\n- Roost\n\nTalonflame\nAbility: Gale Wings\nLevel: 100\nEVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe\nSerious Nature\n- Tailwind\n- Agility\n- Brave Bird\n- Roost\n\nTalonflame\nAbility: Gale Wings\nLevel: 100\nEVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe\nSerious Nature\n- Tailwind\n- Agility\n- Brave Bird\n- Roost\n\nTalonflame\nAbility: Gale Wings\nLevel: 100\nEVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe\nSerious Nature\n- Tailwind\n- Agility\n- Brave Bird\n- Roost\n\nTalonflame\nAbility: Gale Wings\nLevel: 100\nEVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe\nSerious Nature\n- Tailwind\n- Agility\n- Brave Bird\n- Roost\n';
    }
  }, {
    key: 'decide',
    value: function decide(state) {
      if (state.forceSwitch || !this.canRoost(state)) {
        this.ctr = this.ctr + 1;
        // will crash out when ctr >= 7;

        return new _decisions.SWITCH(this.ctr);
      }
      return new _decisions.MOVE(moveId);
    }
  }, {
    key: 'can',
    value: function can(state) {
      if (!state.self.active) return false;
      if (!state.self.active.moves) return false;
      var move = state.self.active.moves.find(function (m) {
        return m.id === moveId;
      });
      if (move.disabled) return false;
      return true;
    }
  }]);

  return Rooster;
}(_ai2.default);

exports.default = Rooster;
exports.default = Rooster;