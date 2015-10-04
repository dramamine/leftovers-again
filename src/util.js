/**
 * Utility functions.
 *
 */
import {BattleMovedex} from '../lib/Pokemon-Showdown/data/moves';
import {BattlePokedex} from '../lib/Pokemon-Showdown/data/pokedex';

class Util {
  toId(text) {
    if(text) return text.toLowerCase().replace(/[^a-z0-9]/g, '');
    return '';
  }

  researchMoveById(id) {
    if (BattleMovedex[id]) return BattleMovedex[id];

    console.warn('couldnt find my move ', id );
    return {};
  }

  researchPokemonById(id) {
    if (BattlePokedex[id]) return BattlePokedex[id];

    console.warn('couldnt find my pokemon ', id );
    return {};
  }
}

const util = new Util();
export default util;
