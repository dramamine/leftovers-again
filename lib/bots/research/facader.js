'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ai = require('../../ai');

var _ai2 = _interopRequireDefault(_ai);

var _decisions = require('../../decisions');

var _damage = require('../../game/damage');

var _damage2 = _interopRequireDefault(_damage);

var _log = require('../../log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Try casting 'Facade' to test out our damage calculator.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Against the 'Rooster' Talonflame, we should do this amt of damage:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Facade: 70 Normal
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * (84, 85, 87, 87, 88, 90, 90, 91, 93, 93, 94, 96, 96, 97, 99, 100)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * If you feel like testing other moves:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Covet: 60 Normal Physical
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * (73, 73, 75, 76, 76, 78, 78, 79, 79, 81, 82, 82, 84, 84, 85, 87)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Aquatail: 90 Water Physical (2x strength)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * (146, 146, 148, 150, 152, 154, 156, 158, 158, 160, 162, 164, 166, 168, 170, 172)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Seed Bomb: 80 Grass Physical (4x weak)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * (16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 19)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * npm run develop -- --bot=anythinggoes/tester/facader.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var Facader = function (_AI) {
  _inherits(Facader, _AI);

  function Facader() {
    _classCallCheck(this, Facader);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Facader).call(this));

    _this.meta = {
      accepts: 'anythinggoes',
      format: 'anythinggoes'
    };
    _this.ctr = -1;
    _this.hasLogged = false;
    return _this;
  }

  _createClass(Facader, [{
    key: 'team',
    value: function team() {
      return '\nCinccino\nAbility: Skill Link\nLevel: 100\nEVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe\nSerious Nature\n- Facade\n- Slam\n- Aqua Tail\n- Seed Bomb\n\nCinccino\nAbility: Skill Link\nLevel: 100\nEVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe\nSerious Nature\n- Facade\n- Slam\n- Aqua Tail\n- Seed Bomb\n\nCinccino\nAbility: Skill Link\nLevel: 100\nEVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe\nSerious Nature\n- Facade\n- Slam\n- Aqua Tail\n- Seed Bomb\n\nCinccino\nAbility: Skill Link\nLevel: 100\nEVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe\nSerious Nature\n- Facade\n- Slam\n- Aqua Tail\n- Seed Bomb\n\nCinccino\nAbility: Skill Link\nLevel: 100\nEVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe\nSerious Nature\n- Facade\n- Slam\n- Aqua Tail\n- Seed Bomb\n\nCinccino\nAbility: Skill Link\nLevel: 100\nEVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe\nSerious Nature\n- Facade\n- Slam\n- Aqua Tail\n- Seed Bomb\n';
    }
  }, {
    key: 'decide',
    value: function decide(state) {
      console.log(state);
      if (state.forceSwitch || !this.canFacade(state)) {
        this.ctr = this.ctr + 1;
        // will crash out when ctr >= 7;

        return new _decisions.SWITCH(this.ctr);
      }
      if (!state.opponent.active || state.opponent.active.length === 0) {
        console.log('NO ACTIVE OPPONENT OH NO');
        return new _decisions.MOVE('facade');
      }

      state.self.active.nature = 'serious';
      state.self.active.level = 100;
      state.opponent.active.nature = 'serious';
      state.opponent.active.level = 100;

      _damage2.default.assumeStats(state.self.active);
      _damage2.default.assumeStats(state.opponent.active);

      if (!this.hasLogged) {
        var est = _damage2.default.getDamageResult(state.self.active, state.opponent.active, 'facade');
        _log2.default.toFile('damagerangetest', '\n' + JSON.stringify(est) + '\n');
        this.hasLogged = true;
      }

      return new _decisions.MOVE('facade');
    }
  }, {
    key: 'canFacade',
    value: function canFacade(state) {
      if (!state.self.active) return false;
      if (!state.self.active.moves) return false;
      var facade = state.self.active.moves.find(function (move) {
        return move.id === 'facade';
      });
      if (facade.pp === 0) return false;
      if (facade.disabled) return false;
      return true;
    }
  }]);

  return Facader;
}(_ai2.default);

exports.default = Facader;
exports.default = Facader;