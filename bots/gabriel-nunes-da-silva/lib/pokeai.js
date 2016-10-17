
/**
 * Your code is pre-built with a very simple bot that chooses a team, then
 * picks randomly from valid moves on its turn.
 */
/**
 * GNunes08
 *
 */
import Typechart from 'game/typechart';
class Pokeai {
  // randomly chooses an element from an array
  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  getEffectiveMove(p_activeMoves, p_types) {
    for (var i = 0; i < p_activeMoves.length; i++) {
      if (Typechart.compare(p_activeMoves[i].type, p_types) > 1) return p_activeMoves[i];
    }
    return false;
  }

}

export default Pokeai;