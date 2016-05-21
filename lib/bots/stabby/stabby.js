'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _damage = require('/media/marten/PERPETUAL_GAZE/leftovers-again/lib/lib/damage');

var _damage2 = _interopRequireDefault(_damage);

var _decisions = require('/media/marten/PERPETUAL_GAZE/leftovers-again/lib/decisions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Stabby always picks the move with the most damage. He doesn't know how to
 * switch out, though.
 *
 */


class Stabby {

  decide(state) {
    if (state.forceSwitch) {
      // our pokemon died :(
      // choose a random one
      const possibleMons = state.self.reserve.filter(mon => {
        if (mon.condition === '0 fnt') return false;
        if (mon.active) return false;
        return true;
      });
      const myMon = this._pickOne(possibleMons);
      return new _decisions.SWITCH(myMon);
    }

    // check each move
    let maxDamage = -1;
    let bestMove = 0;

    state.self.active.moves.forEach((move, idx) => {
      if (move.disabled) return;
      let est = [];
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

  _pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

exports.default = Stabby;