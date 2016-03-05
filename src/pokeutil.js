/**
 * Utility functions.
 *
 */
import BattleMovedex from 'data/moves';
import HonkoMovedex from 'data/moves-ext';
import BattlePokedex from 'data/pokedex';
import log from 'log';

class PokeUtil {
  toId(text) {
    let name = '';
    if (text) {
      // most lines copied from server code..
      name = ('' + text).replace(/[\|\s\[\]\,\']+/g, '').toLowerCase().trim();

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

    if (!BattleMovedex[id]) {
      log.warn('couldn\'t find my move ' + id );
      return {name: id, id: this.toId(id)};
    }

    const battleData = BattleMovedex[id] || {};
    const honkoData = HonkoMovedex[id] || {};

    return Object.assign(battleData, honkoData);
  }

  researchPokemonById(id) {
    id = this.toId(id); // eslint-disable-line
    if (BattlePokedex[id]) return BattlePokedex[id];

    log.warn('couldn\'t find my pokemon ' + id );
    return {name: id, id};
  }

  /**
   * Apply boost levels to a stat.
   *
   * @param  {Number} stat The calculated stat.
   * @param  {Number} mod  The boost level, from -6 to 6.
   * @return {Number} The stat including the boost multiplier.
   */
  boostMultiplier(stat, mod = 0) {
    console.log(stat, mod);
    return mod > 0 ? Math.floor(stat * (2 + mod) / 2)
    : mod < 0 ? Math.floor(stat * 2 / (2 - mod))
      : stat;
  }
}

const util = new PokeUtil();
export default util;
