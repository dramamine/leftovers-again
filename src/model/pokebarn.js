const Pokemon = require('./pokemon');
const Log = require('../log');
const util = require('../pokeutil');

class Pokebarn {
  constructor() {
    this.allmon = [];
  }

  all() {
    return this.allmon;
  }

  /**
   * Create a new Pokemon and save it to this.allmon
   *
   * @param  {String} ident  The ident
   * @param  {String} details  The details
   *
   * @return {Object<Pokemon>}  The mon you've created
   */
  create(ident, details) {
    const res = new Pokemon(ident, details);
    this.allmon.push(res);
    return res;
  }

  /**
   * Get a specific mon from your barn.
   *
   * @param  {String} ident  The ident
   *
   * @return {Object<Pokemon>}  The mon you're looking for
   */
  find(ident) {
    const searchFor = util.identWithoutPosition(ident);

    const matches = this.allmon.filter(mon => mon.ident === searchFor);
    if (matches.length > 1) {
      Log.error('Found multiple mons with the same ident! o fuck');
      Log.error(matches);
    }
    return matches[0];
  }

  /**
   * Get a specific mon from your barn, or create it.
   *
   * @param  {String} ident  The ident
   * @param  {String} details  The details
   *
   * @return {Object<Pokemon>}  The mon you're looking for
   */
  findOrCreate(ident, details) {
    const mon = this.find(ident);
    if (mon) return mon;
    return this.create(ident, details);
  }

  /**
   * Sometimes Pokemon get replaced. Like when Zoroark comes to town.
   *
   * @param  {[type]} ident     The ident, ex. 'p2a: Sabbs'
   * @param  {[type]} details   The details, ex. 'Sableye-Mega, M'
   * @param  {[type]} condition [description]
   * @return {[type]}           [description]
   */
  replace(ident, details, condition) {
    // Log.debug(`replace call: ${ident}|${details}|${condition}`);
    const pos = util.identToPos(ident);
    const replaced = this.findByPos(pos);
    const idx = this.allmon.indexOf(replaced);
    if (idx >= 0) {
      // just remove this guy for now. it's kinda too complicated to
      // try to remember the old info that we're losing (ex. if it
      // was Zoroark, you know the id of an unseen Pokemon)
      this.allmon.splice(idx, 1);
    } else {
      Log.error('Couldnt find the thing we want to replace.');
    }

    const updated = this.findOrCreate(ident, details);

    if (condition) {
      updated.useCondition(condition);
    } else if (replaced.condition) {
      // condition was null, so we probs got details / forme change
      // in that case, use the condition we had before? hppct/conditions
      // probably did not change, but maxhp probably did.
      updated.useCondition(replaced.condition);
    }

    if (details) {
      updated.useDetails(details, true);
    }

    return updated;
  }

  /**
   * Find a Pokemon by its position, ex. 'p2a'
   * @param  {String} pos The position of the Pokemon.
   * @return {Pokemon} The Pokemon object.
   */
  findByPos(pos) {
    return this.allmon.find(mon => mon.position === pos);
  }

}

module.exports = Pokebarn;
