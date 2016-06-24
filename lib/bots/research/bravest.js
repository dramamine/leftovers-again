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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Summon Talonflames to cast 'Brave Bird' over and over.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * npm start -- research/bravest
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var moveId = 'bravebird';

var Bravest = function (_AI) {
  _inherits(Bravest, _AI);

  function Bravest() {
    _classCallCheck(this, Bravest);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Bravest).call(this));

    _this.meta = {
      accepts: 'anythinggoes',
      format: 'anythinggoes',
      nickname: 'Bravest1500000'
    };

    _this.ctr = -1;
    return _this;
  }

  _createClass(Bravest, [{
    key: 'team',
    value: function team() {
      return '\nNamedA (Talonflame)\nAbility: Gale Wings\nLevel: 100\nEVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe\nSerious Nature\n- Brave Bird\n\nNamedB (Talonflame)\nAbility: Gale Wings\nLevel: 100\nEVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe\nSerious Nature\n- Brave Bird\n\nNamedC (Talonflame)\nAbility: Gale Wings\nLevel: 100\nEVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe\nSerious Nature\n- Brave Bird\n\nNamedD (Talonflame)\nAbility: Gale Wings\nLevel: 100\nEVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe\nSerious Nature\n- Brave Bird\n\nNamedE (Talonflame)\nAbility: Gale Wings\nLevel: 100\nEVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe\nSerious Nature\n- Brave Bird\n\nNamedF (Talonflame)\nAbility: Gale Wings\nLevel: 100\nEVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe\nSerious Nature\n- Brave Bird\n';
    }
  }, {
    key: 'decide',
    value: function decide(state) {
      // console.log(state);
      if (state.forceSwitch || state.teamPreview || !this.can(state)) {
        var possibleMons = state.self.reserve.filter(function (mon) {
          if (mon.condition === '0 fnt') return false;
          if (mon.active) return false;
          if (mon.dead) return false;
          return true;
        });
        var myMon = this._pickOne(possibleMons);
        return new _decisions.SWITCH(myMon);
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
  }, {
    key: '_pickOne',
    value: function _pickOne(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
  }]);

  return Bravest;
}(_ai2.default);

exports.default = Bravest;
exports.default = Bravest;