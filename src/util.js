/**
 * Utility functions.
 *
 */
import BattleMovedex from '../data/moves';
import BattlePokedex from '../data/pokedex';

class Util {
  toId(text) {
    if (text) return text.toLowerCase().replace(/[^a-z0-9]/g, '');
    return '';
  }

  researchMoveById(id) {
    id = id.replace('60', ''); // eslint-disable-line
    if (BattleMovedex[id]) return BattleMovedex[id];

    console.warn('couldnt find my move ', id );
    return {name: id, id: this.toId(id)};
  }

  researchPokemonById(id) {
    if (BattlePokedex[id]) return BattlePokedex[id];

    console.warn('couldnt find my pokemon ', id );
    return {name: id, id: this.toId(id)};
  }
}

const util = new Util();
export default util;
