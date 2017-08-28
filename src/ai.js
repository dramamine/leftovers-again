/**
 * AI class. Extend this when creating your bot.
 */
class AI {
  constructor() {} // eslint-disable-line

  /**
   * Abstract function that must be overridden.
   *
   * @param  {String} opponent Your opponent's nickname, in case you want to
   * pull any shenanigans in particular for this player.
   *
   * @return {String}   A Showdown-formatted team string.
   */
  team(opponent) { // eslint-disable-line
    return this.meta.team || '';
  }

  /**
   * Abstract function that must be overridden.
   *
   * @param  {object} state a State object. This object has the following
   * properties:
   *
   * @param {Object} state.self Details about your pokemon.
   *
   * @param {PokemonData|Array<PokemonData>} state.self.active  Contains any of your mons
   * who are "active", i.e. on the front lines this turn. This is intended to
   * be a single Pokemon in Singles matches and an array of Pokemon in Doubles and Triples.
   *
   * @param {Array<PokemonData>} state.self.reserve All the Pokemon on your side.
   * Note that this includes your active Pokemon, who have the property 'active'
   * set to true. You can switch into any Pokemon where neither 'active',
   * 'disabled', nor 'dead' are true.
   *
   * @param {Object} state.opponent Details about your opponent's pokemons.
   *
   * @param {PokemonData|Array<PokemonData>} state.opponent.active  Contains any of your
   * opponent's mons who are "active", i.e. on the front lines this turn. This
   * is intended to be a single Pokemon in Singles matches and an array of
   * Pokemon in Doubles and Triples.
   *
   * @param {Array<PokemonData>} state.opponent.reserve  All the Pokemon on your
   * opponent's side, that you have seen.
   *
   * @param {number} rqid  The request ID. This is needed for server replies
   * and is not really something you need to worry about.
   *
   * @return {Decision} a Decision object, or a Promise that resolves to a
   *         Decision object.
   *
   *
   */
  decide(state) { // eslint-disable-line
    console.error('You need to implement decide() in your AI class!');
    return false;
  }
}

module.exports = AI;
