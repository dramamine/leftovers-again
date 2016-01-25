/**
 * AI class. Extend this when creating your bot.
 */
export default class AI {
  constructor(meta) {
    this.meta = meta;
  }
  /**
   * Abstract function that must be overridden.
   *
   * @param  {object} state a State object. This object has the following
   *
   * @property {Object} state.self Details about your pokemon.
   * @property {Pokemon/Array<Pokemon>} Contains any of your mons who are "active",
   * i.e. on the front lines this turn. This is intended to be a single Pokemon
   * in Singles matches and an array of Pokemon in Doubles and Triples.
   * @property {Array</Pokemon>} state.self.reserve All the Pokemon on your side.
   * Note that this includes your active Pokemon, who have the property 'active'
   * set to true. You can switch into any Pokemon where neither 'active',
   * 'disabled', nor 'dead' are true.
   * @property {Object} opponent Details about your opponent's pokemons.
   * @property {Pokemon/Array<Pokemon>} state.opponent.active  Contains any of your
   * opponent's mons who are "active", i.e. on the front lines this turn. This
   * is intended to be a single Pokemon in Singles matches and an array of
   * Pokemon in Doubles and Triples.
   * @property {Array<Pokemon>} state.opponent.reserve: All the Pokemon on your
   * opponent's side, that you have seen.
   * @property {number} rqid  The request ID. This is needed for server replies
   * and is not really something you need to worry about.
   *
   * @return {Decision} a Decision object, or a Promise that resolves to a
   *         Decision object.
   *
   *
   */
  onRequest(state) { // eslint-disable-line
    console.log('You need to implement onRequest in your AI class!');
    return false;
  }
}
