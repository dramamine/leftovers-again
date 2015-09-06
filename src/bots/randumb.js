/**
 * Randumb bot. This guy follows simple logic: pick a random available move
 * on our active pokemon. When a pokemon dies, pick a random one to replace
 * it.
 *
 */
import AI from '../ai';
class Randumb extends AI {
  constructor() {
    super();
  }

  onRequest(state) {
    if (state.forceSwitch && state.forceSwitch[0] === true) {
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
      return `/choose ${myMon}`;
    }
    // pick a random move
    const possibleMoves = state.active.moves.reduce(
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
