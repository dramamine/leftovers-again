"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The Move class, instantiated when the user wants to use a Move.
 */

var MOVE = exports.MOVE = function () {
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

  function MOVE(id) {
    var target = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    _classCallCheck(this, MOVE);

    this.id = id;
    this.target = target;

    this.shouldMegaEvo = true;
  }

  /**
   * Should this pokemon mega-evolve?
   *
   * @param {Boolean} should  True if it should, false otherwise.
   */


  _createClass(MOVE, [{
    key: "setMegaEvo",
    value: function setMegaEvo(should) {
      this.shouldMegaEvo = should;
    }
  }]);

  return MOVE;
}();

/**
 * The Switch class, instantiated when the user wants to Switch into another
 * Pokemon.
 */


var SWITCH =
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
exports.SWITCH = function SWITCH(id) {
  var target = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  _classCallCheck(this, SWITCH);

  this.id = id;
  this.target = target;
};

/**
 * Either a {@link MOVE} or a {@link SWITCH}. Whatever class this is, is the 'verb' of the
 * action.
 *
 */


var Decision = // eslint-disable-line
/**
 * Decision constructor (abstract)
 *
 * @param {number|string|object} id  The 'noun' of the action.
 * @param {number} target  The index of the target.
 *
 */
exports.Decision = function Decision(id, target) {
  _classCallCheck(this, Decision);
} // eslint-disable-line
;