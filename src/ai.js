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
   * @param  {[type]} state a State object. This object has the following
   * structure:
   *
   * self: Details about your pokemon.
   *   active: {Pokemon} in Singles, {[Pokemon]} otherwise. Contains any of your
   *           mons who are "active", i.e. on the front lines this turn
   *   reserve: [Pokemon] All the Pokemon on your side. Note that this
   *            includes your active Pokemon, who have the property 'active'
   *            set to true. You can switch into any Pokemon where neither
   *            'active', 'disabled', nor 'dead' are true.
   * opponent: Details about your opponent's pokemons.
   *   active: {Pokemon} in Singles. {[Pokemon]} otherwise. Contains any of
   *           your opponent's mons who are "active", i.e. on the front lines
   *           this turn.
   *   reserve: [{Pokemon}] All the Pokemon on your opponent's side, that you
   *            have send.
   *  rqid: The request ID (you don't need to worry about this)
   *
   * @return {Decision} a Decision object, or a Promise that resolves to a
   *         Decision object.
   *
   * @relation Pokemon
   * @relation Decision
   *
   */
  onRequest(state) { // eslint-disable-line
    console.log('You need to implement onRequest in your AI class!');
    return false;
  }
}
