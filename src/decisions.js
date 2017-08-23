/**
 * The Move class, instantiated when the user wants to use a Move.
 */
class MOVE {
  /**
   * Move constructor.
   *
   * @param  {mixed} id The Move object, move index, or move ID associated
   * with the move we're using. Ex. if we have the batle state
   * state.active.moves = [{name: 'thunderbolt'}, ...], ID could be either
   * 0, 'thunderbolt', or {name: 'thunderbolt'}.
   * @param  {number} target The target. Unused in singles battles, and
   * currently not implemented.
   *
   */
  constructor(id, target = null) {
    this.type = 'move';
    this.id = id;
    this.target = target;

    // assume yeah
    this.shouldMegaEvo = true;
    this.shouldZMove = true;
  }

  /**
   * Should this pokemon mega-evolve? (On by default; use this
   * to turn it off.)
   *
   * @param {Boolean} should  True if it should, false otherwise.
   */
  setMegaEvo(should) {
    this.shouldMegaEvo = should;
  }

  /**
   * Should this pokemon use its Z-move when available? (On by default; use this
   * to turn it off.)
   *
   * @param  {Boolean} should  True if it should, false otherwise.
   */
  useZMove(should) {
    this.shouldZMove = should;
  }

}

/**
 * The Switch class, instantiated when the user wants to Switch into another
 * Pokemon.
 */
class SWITCH {
  /**
   * Switch constructor.
   *
   * @param  {mixed} id The Pokemon object, Pokemon index, or Pokemon species
   * associated with the Pokemon we'd like to switch into. Ex. if we have the
   * battle state state.reserve = [{species: 'pikachu'}, ...], ID could be
   * either 0, 'pikachu', or {species: 'pikachu'}.
   * @param  {number} target The target spot to switch into. Unused in singles
   * battles, and currently not implemented.
   */
  constructor(id, target = null) {
    this.type = 'switch';
    this.id = id;
    this.target = target;
  }
}

/**
 * Either a {@link MOVE} or a {@link SWITCH}. Whatever class this is, is the 'verb' of the
 * action.
 *
 */
class Decision { // eslint-disable-line
  /**
   * Decision constructor (abstract)
   *
   * @param {number|string|object} id  The 'noun' of the action.
   * @param {number} target  The index of the target.
   *
   */
  constructor(id, target) {} // eslint-disable-line
}

module.exports = {
  MOVE,
  SWITCH,
  Decision
};
