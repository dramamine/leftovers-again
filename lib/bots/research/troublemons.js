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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * See if this guy mega-evolves. Or not! Check shouldMegaEvo to see what
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * you're doing
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * npm run develop -- --bot=research/megaevo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var Trouble = function (_AI) {
  _inherits(Trouble, _AI);

  function Trouble() {
    _classCallCheck(this, Trouble);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Trouble).call(this));

    _this.meta = {
      accepts: 'anythinggoes',
      format: 'anythinggoes'
    };

    _this.ctr = -1;
    return _this;
  }

  _createClass(Trouble, [{
    key: 'team',
    value: function team() {
      return '\nBasculin-Blue-Striped @ Assault Vest\nAbility: Adaptability\nEVs: 252 Atk / 4 SpA / 252 Spe\nNaive Nature\n- Crunch\n- Facade\n- Hidden Power [Grass]\n- Waterfall\n\nZoroark @ Choice Specs\nAbility: Illusion\nEVs: 252 SpA / 4 SpD / 252 Spe\nTimid Nature\n- Dark Pulse\n- Focus Blast\n- Trick\n- Sludge Bomb\n\nKyurem-White @ Choice Specs\nAbility: Turboblaze\nEVs: 252 SpA / 4 SpD / 252 Spe\nModest Nature\n- Draco Meteor\n- Ice Beam\n- Focus Blast\n- Fusion Flare\n';

      // Kyurem-Black @ Leftovers
      // Ability: Teravolt
      // EVs: 56 HP / 216 Atk / 236 Spe
      // Lonely Nature
      // - Substitute
      // - Fusion Bolt
      // - Dragon Claw
      // - Ice Beam
    }
  }, {
    key: 'decide',
    value: function decide(state) {
      if (state.forceSwitch || state.teamPreview || Math.random() < 0.2) {
        // our pokemon died :(
        // choose a random one
        var possibleMons = state.self.reserve.filter(function (mon) {
          if (mon.condition === '0 fnt') return false;
          if (mon.active) return false;
          return true;
        });
        var myMon = this.pickOne(possibleMons);
        console.log('switching into this guy: ', myMon);
        return new _decisions.SWITCH(myMon);
      }
      // pick a random move
      try {
        var possibleMoves = state.self.active.moves.filter(function (move) {
          return !move.disabled;
        });
        var myMove = this.pickOne(possibleMoves);
        console.log('makin a move:', myMove.id);
        return new _decisions.MOVE(myMove);
      } catch (e) {
        console.log('broke when checking possible moves:', e);
        console.dir(state);
        return null;
      }
    }
  }, {
    key: 'pickOne',
    value: function pickOne(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
  }]);

  return Trouble;
}(_ai2.default);

exports.default = Trouble;