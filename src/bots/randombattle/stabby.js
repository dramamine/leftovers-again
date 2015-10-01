/**
 * Stabby always picks the move with the most damage. He doesn't know how to
 * switch out, though.
 *
 */

import AI from '../../ai';
import Damage from '../../lib/damage';


class Stabby extends AI {
  constructor() {
    console.log('STABBY: built');
    super();
  }

  onRequest(state) {
    console.log('got my request...', state);
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
    console.log('my opponent: ' + state.activeOpponent);
    if (!state.activeOpponent) {
      return null;
    }
    state.active[0].moves.forEach( (move, idx) => {
      console.log('looking up move ', move);
      const est = Damage.getDamageResult(
        state.activeSelf,
        state.activeOpponent,
        move
      )[1];
      console.log('estimated ' + est + ' for move ' + move.name);
      if (est > maxDamage) {
        maxDamage = est;
        bestMove = idx;
      }
    });
    console.log('picked best move', bestMove);
    const myMove = bestMove + 1;
    // const myMove = state.active[0].moves.findIndex(bestMove) + 1; // moves are 1-indexed

    return `/move ${myMove}`;
  }

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

export default Stabby;
