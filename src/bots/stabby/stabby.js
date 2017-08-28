/**
 * Stabby always picks the move with the most damage. He doesn't know how to
 * switch out, though.
 *
 */
const Damage = require('@la/game/damage');

const { MOVE, SWITCH } = require('@la/decisions');

module.exports = class Stabby {

  decide(state) {
    if (state.forceSwitch) {
      // our pokemon died :(
      // choose a random one
      const possibleMons = state.self.reserve.filter( (mon) => {
        if (mon.condition === '0 fnt') return false;
        if (mon.active) return false;
        return true;
      });
      const myMon = this.pickOne(possibleMons);
      return new SWITCH(myMon);
    }

    // check each move
    let maxDamage = -1;
    let bestMove = 0;

    state.self.active.moves.forEach((move, idx) => {
      if (move.disabled) return;
      let est = [];
      try {
        est = Damage.getDamageResult(
          state.self.active,
          state.opponent.active,
          move
        );
      } catch (e) {
        console.log(e);
        console.log(state.self.active, state.opponent.active, move);
      }
      if (est[0] > maxDamage) {
        maxDamage = est[0];
        bestMove = idx;
      }
    });

    return new MOVE(bestMove);
  }

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
