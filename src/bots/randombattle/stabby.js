/**
 * Stabby always picks the move with the most damage. He doesn't know how to
 * switch out, though.
 *
 */

import AI from '../../ai';
import Damage from '../../lib/damage';

import {MOVE, SWITCH} from '../../decisions';

const meta = {
  battletype: 'randombattle',
  author: 'marten'
};

class Stabby extends AI {
  constructor() {
    // console.log('STABBY: built');
    super(meta);
  }

  onRequest(state) {
    // console.log('got my request...', state);
    if (state.forceSwitch) {
      // our pokemon died :(
      // choose a random one
      const possibleMons = state.self.reserve.reduce(
        (prev, current, idx) => {
          if (current.condition !== '0 fnt') {
            prev.push(idx);
          }
          return prev;
        }, []);
      const myMon = this.pickOne(possibleMons); // pokemons are 1-indexed
      return new SWITCH(myMon);
    }


    // check each move
    let maxDamage = 0;
    let bestMove;

    state.self.active.moves.forEach( (move, idx) => {
      // console.log('looking up move ', move);
      const est = Damage.getDamageResult(
        state.self.active,
        state.self.opponent,
        move
      );
      // console.log('estimated ' + est + ' for move ' + move.name);
      if (est > maxDamage) {
        maxDamage = est;
        bestMove = idx;
      }
    });

    return new MOVE(bestMove);
  }

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

export default Stabby;
