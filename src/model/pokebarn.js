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

  create(ident, details) {
    const res = new Pokemon(ident, details);
    this.allmon.push(res);
    return res;
  }

  find(ident) {
    const searchFor = util.identWithoutPosition(ident);
    const matches = this.allmon.filter(mon => mon.ident === searchFor);
    if (matches.length > 1) {
      Log.error('Found multiple mons with the same ident! o fuck');
      Log.error(matches);
    }
    return matches[0];
  }

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
    const pos = util.identToPos(ident);
    const replaced = this.findByPos(pos);
    const idx = this.allmon.indexOf(replaced);
    if (idx >= 0) {
      Log.warn('replace call:', ident, details, condition);
      Log.warn('Found zoroark! replacing him!');
      this.allmon.splice(idx, 1);
    } else {
      Log.error('Couldnt find the thing we want to replace.');
      Log.error(ident, details, condition);
    }

    const updated = this.findOrCreate(ident, details);
    if (!condition) {
      updated.useCondition(condition);
    } else {
      Log.error('pokebarn.replace: condition was empty? marten is trying to solve.');
      Log.error(ident, details, condition);
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
