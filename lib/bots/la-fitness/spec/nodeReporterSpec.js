'use strict';

var _pokeutil = require('pokeutil');

var _pokeutil2 = _interopRequireDefault(_pokeutil);

var _iterator = require('la-fitness/src/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _nodeReporter = require('la-fitness/src/nodeReporter');

var _nodeReporter2 = _interopRequireDefault(_nodeReporter);

var _fitness = require('la-fitness/src/fitness');

var _fitness2 = _interopRequireDefault(_fitness);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('nodeReporter', () => {
  let state;
  beforeEach(() => {
    const mine = Object.assign({
      hp: 100,
      maxhp: 100,
      hppct: 100
    }, _pokeutil2.default.researchPokemonById('eevee'));
    const yours = Object.assign({
      hp: 100,
      maxhp: 100,
      hppct: 100
    }, _pokeutil2.default.researchPokemonById('meowth'));
    state = {
      self: {
        active: mine
      },
      opponent: {
        active: yours
      }
    };
  });
  it('should handle this situation', () => {
    spyOn(_fitness2.default, '_probablyGoesFirst').and.returnValue(true);
    state.self.active.moves = [_pokeutil2.default.researchMoveById('surf'), _pokeutil2.default.researchMoveById('blazekick')];
    state.self.reserve = [Object.assign(_pokeutil2.default.researchPokemonById('bulbasaur'), {
      hp: 100,
      maxhp: 100,
      hppct: 100
    })];

    const nodes = _iterator2.default.iterateSingleThreaded(state, 1);
    const reports = nodes.map(node => {
      const report = _nodeReporter2.default.report(node);
      console.log(report);
      // console.log(node);
      return report;
    });
  });
});