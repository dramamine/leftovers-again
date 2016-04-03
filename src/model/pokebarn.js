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

  create(ident) {
    const owner = this._identToOwner(ident);
    const position = this._identToPos(ident);
    const species = ident.substr(ident.indexOf(' ') + 1);

    const res = new Pokemon(species);
    res.owner = owner;
    res.position = position;

    this.allmon.push(res);
    return res;
  }

  find(ident) {
    const owner = this._identToOwner(ident);
    const position = this._identToPos(ident);
    const species = ident.substr(ident.indexOf(' ') + 1);

    const matches = this.allmon.filter( (mon) => {
      // @TODO really shouldn't have to util.toId these things.
      return owner === mon.owner && util.toId(species) === util.toId(mon.species) && !mon.dead;
    });

    const samePosition = matches.find( mon => mon.position === position);
    if (samePosition) return samePosition;
    return matches[0];
  }

  findOrCreate(ident) {
    const mon = this.find(ident);
    if (mon) return mon;

    return this.create(ident);
  }

  findByOrder(ident, order) {
    // const owner = this._identToOwner(ident);
    const species = ident.substr(ident.indexOf(' ') + 1);

    const matches = this.allmon.filter( (mon) => {
      // @TODO really shouldn't have to util.toId these things.
      return order === mon.order;
    });

    if (matches.length > 1) {
      Log.error('found too many pokemons with that order.');
      Log.error(`ident: ${ident}, order: ${order}`);
      Log.error('heres an allmon dump');
      this.allmon.forEach((mon) => {
        Log.error(`${mon.species} ${mon.position} ${mon.hp} ${mon.owner}`);
      });
    }

    const res = matches[0];
    if (res.species !== util.toId(species)) {
      Log.error('o fuck, wrong species. fucked up the order somehow.');
      Log.error(`expected ${species} but founr ${res.species}`);
    }
    return res;
  }

  /**
   * Find a Pokemon by its ID, ex. 'p2a: Pikachu'
   *
   * @param  {String} id The Pokemon ID.
   * @return {Pokemon} The Pokemon object.
   */
  _findById(id) {
    return this.allmon.find( (mon) => { return mon.id === id; });
  }

  /**
   * Find a Pokemon by its position, ex. 'p2a'
   * @param  {String} pos The position of the Pokemon.
   * @return {Pokemon} The Pokemon object.
   */
  findByPos(pos) {
    return this.allmon.find( (mon) => { return mon.position === pos; });
  }

  /**
   * Get the position from the 'ident'.
   * @param  {String} ident The Pokemon ident.
   * @return {String} The position.
   */
  _identToPos(ident) {
    const posStr = ident.substr(0, ident.indexOf(':'));
    const position = (posStr.length === 3) ? posStr : null;
    return position;
  }

  /**
   * Get the owner from the 'ident'.
   * @param  {String} ident The Pokemon ident.
   * @return {String} The owner.
   */
  _identToOwner(ident) {
    return ident.substr(0, 2);
  }


}

export default Pokebarn;
