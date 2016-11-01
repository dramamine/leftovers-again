import Pokemon from './pokemon';
import Log from '../log';
import util from '../pokeutil';

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

    const matches = this.allmon.filter(mon => mon.ident.indexOf(searchFor) === 0);
    if (matches.length > 1) {
      Log.error('Found multiple mons with the same ident! o fuck');
      Log.error(matches);
    } else if (matches[0] && matches[0].ident !== searchFor) {
      Log.debug(`fuzzy matched: ${matches[0].ident} matched for ${searchFor}`);
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
   * @param  {[type]} ident     [description]
   * @param  {[type]} details   [description]
   * @param  {[type]} condition [description]
   * @return {[type]}           [description]
   */
  replace(ident, details, condition) {
    Log.warn(`replace call: ${ident}|${details}|${condition}`);   
    const pos = util.identToPos(ident);
    const replaced = this.findByPos(pos);
    const idx = this.allmon.indexOf(replaced);
    if (idx >= 0) {
      // Log.warn('Found zoroark! replacing him!');
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

export default Pokebarn;
