/**
 * Utility functions.
 *
 */
import BattleMovedex from 'data/moves';
import BattlePokedex from 'data/pokedex';
import log from 'log';

class PokeUtil {
  toId(text) {
    let name = '';
    if (text) {
      // most lines copied from server code..
      name = ('' + text).replace(/[\|\s\[\]\,]+/g, '').toLowerCase().trim();

      // these two are not! but I needed them.
      name = name.replace('-', '');
      name = name.replace('.', '');
      name = name.replace(' ', '');

      if (name.length > 18) name = name.substr(0, 18).trim();
    }
    return name;
  }

  researchMoveById(id) {
    // hidden power moves end with '60'. hidden power ground comes out as
    // hiddenpowerground6 due to the 18-character limit. it's kept as
    // hiddenpowerground in our data.
    id = this.toId(id).replace(/6[0]?$/,''); // eslint-disable-line
    if (BattleMovedex[id]) return BattleMovedex[id];

    log.warn('couldn\'t find my move ' + id );
    return {name: id, id: this.toId(id)};
  }

  researchPokemonById(id) {
    id = this.toId(id); // eslint-disable-line
    if (BattlePokedex[id]) return BattlePokedex[id];

    log.warn('couldn\'t find my pokemon ' + id );
    return {name: id, id};
  }
}

const util = new PokeUtil();
export default util;
