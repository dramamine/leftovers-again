'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Stabby always picks the move with the most damage. He doesn't know how to
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * switch out, though.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _damage = require('../../game/damage');

var _damage2 = _interopRequireDefault(_damage);

var _decisions = require('../../decisions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Stabby = function () {
  function Stabby() {
    _classCallCheck(this, Stabby);
  }

  _createClass(Stabby, [{
    key: 'decide',
    value: function decide(state) {
      if (state.forceSwitch) {
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

      // check each move
      var maxDamage = -1;
      var bestMove = 0;

      state.self.active.moves.forEach(function (move, idx) {
        if (move.disabled) return;
        var est = [];
        try {
          est = _damage2.default.getDamageResult(state.self.active, state.opponent.active, move);
        } catch (e) {
          console.log(e);
          console.log(state.self.active, state.opponent.active, move);
        }
        if (est[0] > maxDamage) {
          maxDamage = est[0];
          bestMove = idx;
        }
      });

      return new _decisions.MOVE(bestMove);
    }
  }, {
    key: '_pickOne',
    value: function _pickOne(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
  }]);

  return Stabby;
}();

exports.default = Stabby;