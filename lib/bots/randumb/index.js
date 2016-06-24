'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ai = require('../../ai');

var _ai2 = _interopRequireDefault(_ai);

var _decisions = require('../../decisions');

var _team2 = require('../../team');

var _team3 = _interopRequireDefault(_team2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Randumb bot. This guy follows simple logic: pick a random available move
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * on our active pokemon. When a pokemon dies, pick a random one to replace
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * it.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var Randumb = function (_AI) {
  _inherits(Randumb, _AI);

  function Randumb() {
    _classCallCheck(this, Randumb);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Randumb).call(this));

    _this.meta = {
      accepts: 'ALL', // trying this out, fingers crossed
      format: 'randombattle',
      team: null,
      version: 'alpha',
      nickname: 'Randumb ★marten★'
    };
    return _this;
  }

  _createClass(Randumb, [{
    key: 'team',
    value: function team() {
      // if this gets called use a predetermined random team.
      // @TODO hardcoded to a Slowking team.
      return _team3.default.random(0);
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

  return Randumb;
}(_ai2.default);

exports.default = Randumb;