/**
 * Randumb bot. This guy follows simple logic: pick a random available move
 * on our active pokemon. When a pokemon dies, pick a random one to replace
 * it.
 *
 */
const meta = {
  battletype: 'randombattle'
};

import AI from '../../ai';
class Randumb extends AI {
  constructor() {
    super(meta);
  }

  onRequest(state) {
    console.dir(state);

    if (state.forceSwitch) {
      console.log('Im switching OK!!');
      console.log(state.self.reserve);
      // our pokemon died :(
      // choose a random one
      const possibleMons = state.self.reserve.reduce(
        (prev, current, idx) => {
          if (current.condition !== '0 fnt') {
            prev.push(idx);
          }
          return prev;
        }, []);
      const myMon = this.pickOne(possibleMons) + 1; // pokemons are 1-indexed
      return `/switch ${myMon}`;
    }
    // pick a random move
    const possibleMoves = state.self.active.moves.reduce(
      (prev, current, idx) => {
        if (current.pp > 0 && !current.disabled) {
          prev.push(idx);
        }
        return prev;
      }, []);
    const myMove = this.pickOne(possibleMoves) + 1; // moves are 1-indexed
    return `/move ${myMove}`;
  }

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

export default Randumb;
