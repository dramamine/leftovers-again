/**
 * Utility functions.
 *
 */
const BattleMovedex = require('./data/moves.json');
const HonkoMovedex = require('./data/moves-ext.json');
const BattlePokedex = require('./data/pokedex.json');
const log = require('./log');

class PokeUtil {
  /**
   * Return the Smogon official ID for a given Pokemon. This works on both
   * Pokemon 'species' and move 'name' fields. Use this field when you need
   * the 'standardized' name. These are used when you're looking up stuff from
   * the data folder.
   *
   * @param  {String} text The field to transform.
   * @return {String}      The ID.
   */
  toId(text) {
    let name = '';
    if (!text) return name;

    // most lines copied from server code..
    name = ('' + text).replace(/[\|\s\[\],']+/g, '').toLowerCase().trim();

    // these lines are not! but I needed them.
    name = name.replace(/[\-\. ]+/g, '');

    name = name.replace(/[^a-z0-9]/gi, '');

    if (name.length > 18) {
      name = name.substr(0, 18).trim();
    }
    return name;
  }

  /**
   * Get an object fulla data about a move.
   *
   * Data is sourced both from the official Smogon server and from the Honko
   * damage calculator. Honko data helps with the damage calculator.
   * @param  {String} id The move ID.
   * @return {Move}  A Move object.
   */
  researchMoveById(id) {
    // hidden power moves end with '60'. hidden power ground comes out as
    // hiddenpowerground6 due to the 18-character limit. it's kept as
    // hiddenpowerground in our data.
    id = this.toId(id).replace(/6[0]?$/, ''); // eslint-disable-line

    if (!BattleMovedex[id]) {
      log.warn(`couldn't find my move ${id}`);
      return {
        name: id,
        id: this.toId(id)
      };
    }

    const battleData = BattleMovedex[id] || {};
    const honkoData = HonkoMovedex[id] || {};

    return Object.assign(battleData, honkoData);
  }

  /**
   * Get an object fulla data about a Pokemon.
   *
   * Data is a limited number of fields from the official Smogon server
   * data files.
   *
   * @param  {String} id The Pokemon ID.
   * @return {Pokemon}   A Pokemon object.
   */
  researchPokemonById(id) {
    id = this.toId(id); // eslint-disable-line
    if (BattlePokedex[id]) {
      const res = this.clone(BattlePokedex[id]);
      res.id = id;
      return res;
    }

    log.warn(`couldn't find my pokemon ${id}`);
    return {
      name: id,
      id
    };
  }

  /**
   * Combine two boost objects. (For example, use this to apply boost effects
   * to a mon's existing boosts.) Boost objects have keys for their stats
   * (atk, def, spa, spd, spe) and values representing their boost level.
   *
   * @param  {Object} old     A boost object.
   * @param  {Object} updates A boost object.
   * @return {Object}         A boost object.
   */
  boostCombiner(old = {}, updates = {}) {
    Object.keys(updates).forEach((boost) => {
      old[boost] = Math.min(6, Math.max(-6,
        (old[boost] || 0) + updates[boost]));
    });
    return old;
  }

  /**
   * Apply boost levels to a stat.
   *
   * @param  {Number} stat The calculated stat.
   * @param  {Number} mod  The boost level, from -6 to 6.
   * @return {Number} The stat including the boost multiplier.
   */
  boostMultiplier(stat, mod = 0) {
    return mod > 0 ? Math.floor(stat * (2 + mod) / 2)
      : mod < 0 ? Math.floor(stat * 2 / (2 - mod))
        : stat;
  }

  /**
   * Get the position from the 'ident'.
   * @param  {String} ident The Pokemon ident.
   * @return {String} The position.
   */
  identToPos(ident) {
    const posStr = ident.substr(0, ident.indexOf(':'));
    const position = (posStr.length === 3) ? posStr : null;
    return position;
  }

  /**
   * Get the owner from the 'ident'.
   * @param  {String} ident The Pokemon ident.
   * @return {String} The owner.
   */
  identToOwner(ident) {
    return ident.substr(0, 2);
  }

  identWithoutPosition(ident) {
    const splits = ident.split(':');
    const player = splits[0];
    const nickname = splits.slice(1).join(':')
    return player.substr(0, 2) + ':' + nickname;
  }

  clone(x) {
    return JSON.parse(JSON.stringify(x));
  }

}

const util = new PokeUtil();
module.exports = util;
