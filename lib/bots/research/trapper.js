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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Use dudes that trap the opponent. Good for seeing if the bot can handle
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * this without crashing.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * npm start -- research/bravest
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var Trapper = function (_AI) {
  _inherits(Trapper, _AI);

  function Trapper() {
    _classCallCheck(this, Trapper);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Trapper).call(this));

    _this.meta = {
      accepts: 'anythinggoes',
      format: 'anythinggoes',
      nickname: 'Trapper ★marten★'
    };

    _this.ctr = -1;
    return _this;
  }

  _createClass(Trapper, [{
    key: 'team',
    value: function team() {
      return '\nTrippy (Trapinch) @ Berry Juice\nLevel: 5\nAbility: Arena Trap\nEVs: 156 HP / 36 Atk / 236 Def / 76 SpD\nAdamant Nature\n- Earthquake\n- Feint\n- Rock Slide\n- Toxic\n\nWynaut (Wynaut) @ Berry Juice\nLevel: 5\nAbility: Shadow Tag\nEVs: 236 HP / 132 Def / 132 SpD\nBold Nature\n- Encore\n- Counter\n- Mirror Coat\n- Safeguard\n\nTrappy (Trapinch) @ Berry Juice\nLevel: 5\nAbility: Arena Trap\nEVs: 156 HP / 36 Atk / 236 Def / 76 SpD\nAdamant Nature\n- Earthquake\n- Feint\n- Rock Slide\n- Toxic\n\nWhynaut (Wynaut) @ Berry Juice\nLevel: 5\nAbility: Shadow Tag\nEVs: 236 HP / 132 Def / 132 SpD\nBold Nature\n- Encore\n- Counter\n- Mirror Coat\n- Safeguard\n\nTroppy (Trapinch) @ Berry Juice\nLevel: 5\nAbility: Arena Trap\nEVs: 156 HP / 36 Atk / 236 Def / 76 SpD\nAdamant Nature\n- Earthquake\n- Feint\n- Rock Slide\n- Toxic\n\nWhinenaut (Wynaut) @ Berry Juice\nLevel: 5\nAbility: Shadow Tag\nEVs: 236 HP / 132 Def / 132 SpD\nBold Nature\n- Encore\n- Counter\n- Mirror Coat\n- Safeguard\n';
    }
  }, {
    key: 'decide',
    value: function decide(state) {
      if (state.forceSwitch || state.teamPreview) {
        // our pokemon died :(
        // choose a random one
        var possibleMons = state.self.reserve.filter(function (mon) {
          if (mon.condition === '0 fnt') return false;
          if (mon.active) return false;
          return true;
        });
        var myMon = this._pickOne(possibleMons);
        return new _decisions.SWITCH(myMon);
      }
      // pick a random move
      var possibleMoves = state.self.active.moves.filter(function (move) {
        return !move.disabled;
      });
      var myMove = this._pickOne(possibleMoves);
      return new _decisions.MOVE(myMove);
    }
  }, {
    key: '_pickOne',
    value: function _pickOne(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
  }]);

  return Trapper;
}(_ai2.default);

exports.default = Trapper;
exports.default = Trapper;