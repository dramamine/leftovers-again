'use strict';

var _evaluator = require('la-fitness/src/evaluator');

var _evaluator2 = _interopRequireDefault(_evaluator);

var _pokeutil = require('pokeutil');

var _pokeutil2 = _interopRequireDefault(_pokeutil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('evaluator', () => {
  describe('evaluateNode', () => {
    let state;
    let yourOptions;
    beforeEach(() => {
      state = {
        self: {
          active: Object.assign({
            hp: 100,
            maxhp: 100,
            boostedStats: {
              spe: 105
            }
          }, _pokeutil2.default.researchPokemonById('onix'))
        },
        opponent: {
          active: Object.assign({
            hp: 100,
            maxhp: 100,
            boostedStats: {
              spe: 95
            }
          }, _pokeutil2.default.researchPokemonById('bulbasaur'))
        },
        field: 'dont lose this'
      };
      yourOptions = [_pokeutil2.default.researchMoveById('waterpulse'), _pokeutil2.default.researchMoveById('swordsdance'), _pokeutil2.default.researchMoveById('toxic')];
    });
    it('should notice the worst situation kills us', () => {
      // onix is 4x weak to water.
      const myMove = _pokeutil2.default.researchMoveById('splash');
      const node = { state };
      const res = _evaluator2.default.evaluateNode(node, myMove, yourOptions);
      console.log(res);
      expect(res.fitness).toBeLessThan(0);
      expect(res.state.self.active.dead).toBe(true);
      expect(res.state.self.active.hp).toEqual(0);
      expect(res.state.field).toBeTruthy();
    });
  });
});