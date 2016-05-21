'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _turnsimulator = require('./turnsimulator');

var _turnsimulator2 = _interopRequireDefault(_turnsimulator);

var _formats = require('data/formats');

var _formats2 = _interopRequireDefault(_formats);

var _log = require('log');

var _log2 = _interopRequireDefault(_log);

var _fitness = require('./fitness');

var _fitness2 = _interopRequireDefault(_fitness);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Evaluator {

  evaluateNode(node, myChoice, yourOptions, depth = 1) {
    const state = node.state;
    _log2.default.debug('imagining I chose ' + myChoice.id);

    // simulate each of the opponent's choices
    const whatCouldHappen = yourOptions.map(yourChoice => {
      // Log.debug('looking at your choice:' + yourChoice.id);
      // an array of {state, chance} objects.
      const possibilities = _turnsimulator2.default.simulate(state, myChoice, yourChoice);
      possibilities.forEach(possibility => {
        possibility.fitnessDetails = _fitness2.default.rate(possibility.state, depth);
        possibility.fitness = possibility.fitnessDetails.summary;
        if (isNaN(possibility.fitness)) {
          console.error('stop the presses! this state was rated wrong');
          console.error(possibility.state);
        }
      });
      const expectedValue = possibilities.reduce((prev, item) => {
        return prev + item.fitness * item.chance;
      }, 0);
      // possibilities might be extraneous here...
      // Log.debug('ev calculation:', yourChoice.id, expectedValue);
      return { possibilities, expectedValue, yourChoice };
    }).sort((a, b) => a.expectedValue - b.expectedValue);
    // Log.debug('made it past teh loop');
    // at this point, whatCouldHappen is an array of all the resulting situations
    // from our opponent's choice. it's sorted by expected value, so the first
    // entry is the worst situation for us. note that this is a big assumption
    // on our part - maybe our opponent can't even perform that move, or maybe
    // we switched into another Pokemon and our opponent would never have guessed
    // about it IRL. but we're still making it.

    // Log.debug('worst-case scenario:', whatCouldHappen[0].yourChoice.id);
    // Log.debug(whatCouldHappen[0]);
    // Log.debug('best-case scenario:', whatCouldHappen[whatCouldHappen.length - 1].yourChoice.id);
    // Log.debug(whatCouldHappen[whatCouldHappen.length - 1]);

    const worstCase = whatCouldHappen[0];

    const evaluated = {
      prevNode: node,
      state: worstCase.possibilities[0].state,
      fitnessDetails: worstCase.possibilities[0].fitnessDetails,
      fitness: worstCase.expectedValue,
      myChoice,
      yourChoice: worstCase.yourChoice,
      depth: depth - 1
    };

    if (whatCouldHappen.length > 1) {
      const betterCase = whatCouldHappen[1];
      evaluated.betterCase = {
        risk: this._considerSecondWorstCase(state, worstCase, betterCase),
        fitness: betterCase.fitness
      };
    }

    if (evaluated.state.self.active.dead || evaluated.state.opponent.active.dead || evaluated.depth === 0) {
      evaluated.terminated = true;
    }

    return evaluated;
  }

  /**
   * @TODO
   *
   *
   * @param  {[type]} state      [description]
   * @param  {[type]} worstCase  [description]
   * @param  {[type]} betterCase [description]
   * @return {[type]}            [description]
   */
  _considerSecondWorstCase(state, worstCase, betterCase) {
    let risk = 1;

    // has used this before, but decides not to this turn
    const hasUsedThisBefore = 0.5;
    if (state.opponent.active.seenMoves && state.opponent.active.seenMoves.indexOf(worstCase.yourChoice.id) > -1) {
      risk *= hasUsedThisBefore;
    } else {
      // chance he doesn't have this move
      let known = 0;
      if (state.opponent.active.seenMoves) {
        known = state.opponent.active.seenMoves.length;
      }
      const emptySlots = 4 - known;
      if (emptySlots < 0 || emptySlots > 4) {
        _log2.default.error('calculated emptySlots wrong', state.opponent.active.seenMoves);
      }
      const possibleMoves = _formats2.default[state.opponent.active.id].randomBattleMoves.length - known;
      const chanceHeHasMoveWeHaventSeen = emptySlots / possibleMoves;
      risk *= 1 - chanceHeHasMoveWeHaventSeen;
    }

    return risk;
  }

}

exports.default = new Evaluator();