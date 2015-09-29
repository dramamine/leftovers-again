/**
 * Stabby always picks the move with the most damage. He doesn't know how to
 * switch out, though.
 *
 */

import AI from '../../ai';
import Damage from '../../lib/damage';


class Stabby extends AI {
  constructor() {
    super();
  }

  onRequest(state) {
    if (state.forceSwitch) {
      // our pokemon died :(
      // choose a random one
      const possibleMons = state.side.pokemon.reduce(
        (prev, current, idx) => {
          if (current.condition !== '0 fnt') {
            prev.push(idx);
          }
          return prev;
        }, []);
      const myMon = this.pickOne(possibleMons) + 1; // pokemons are 1-indexed
      return `/switch ${myMon}`;
    }


    // check each move
    let maxDamage = 0;
    let bestMove;
    state.active[0].moves.each( (move) => {
      const est = Damage.getDamageResult(
        state.active[0],
        state.activeOpponent,
        move
      )[1];
      if (est > maxDamage) {
        maxDamage = est;
        bestMove = move;
      }
    });

    const myMove = state.active[0].moves.findIndex(bestMove) + 1; // moves are 1-indexed

    return `/move ${myMove}`;
  }

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

export default Stabby;
