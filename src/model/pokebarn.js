import util from 'pokeutil';
import Pokemon from 'model/pokemon';
import Log from 'log';

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
    const matches = this.allmon.filter( (mon) => {
      return searchFor === mon.ident;
    });
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
   * Find a Pokemon by its position, ex. 'p2a'
   * @param  {String} pos The position of the Pokemon.
   * @return {Pokemon} The Pokemon object.
   */
  findByPos(pos) {
    return this.allmon.find( (mon) => { return mon.position === pos; });
  }

}

export default Pokebarn;
