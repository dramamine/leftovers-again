'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ai = require('../../ai');

var _ai2 = _interopRequireDefault(_ai);

var _team2 = require('../../game/team');

var _team3 = _interopRequireDefault(_team2);

var _decisions = require('../../decisions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Testing out specific random teams.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * npm run develop -- --bot=predetermined-random
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var Predetermined = function (_AI) {
  _inherits(Predetermined, _AI);

  function Predetermined() {
    _classCallCheck(this, Predetermined);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Predetermined).call(this));

    _this.meta = {
      accepts: 'anythinggoes',
      format: 'anythinggoes'
    };

    _this.ctr = -1;
    return _this;
  }

  _createClass(Predetermined, [{
    key: 'team',
    value: function team() {
      return _team3.default.random();
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
        var myMon = this.pickOne(possibleMons);
        return new _decisions.SWITCH(myMon);
      }
      // pick a random move
      try {
        var possibleMoves = state.self.active.moves.filter(function (move) {
          return !move.disabled;
        });
        var myMove = this.pickOne(possibleMoves);
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

  return Predetermined;
}(_ai2.default);

exports.default = Predetermined;
exports.default = Predetermined;