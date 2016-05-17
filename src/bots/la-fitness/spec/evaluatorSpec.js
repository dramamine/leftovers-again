import Evaluator from 'la-fitness/src/evaluator';
import util from 'pokeutil';

describe('evaluator', () => {
  describe('evaluateNode', () => {
    let state;
    let yourOptions;
    beforeEach( () => {
      state = {
        self: {
          active: Object.assign({
            hp: 100,
            maxhp: 100,
            boostedStats: {
              spe: 105
            },
          }, util.researchPokemonById('onix'))
        },
        opponent: {
          active: Object.assign({
            hp: 100,
            maxhp: 100,
            boostedStats: {
              spe: 95
            },
          }, util.researchPokemonById('bulbasaur'))
        },
        field: 'dont lose this'
      };
      yourOptions = [
        util.researchMoveById('waterpulse'),
        util.researchMoveById('swordsdance'),
        util.researchMoveById('toxic'),
      ];
    });
    it('should notice the worst situation kills us', () => {
      // onix is 4x weak to water.
      const myMove = util.researchMoveById('splash');
      const node = {state};
      const res = Evaluator.evaluateNode(node, myMove, yourOptions);
      console.log(res);
      expect(res.fitness).toBeLessThan(0);
      expect(res.state.self.active.dead).toBe(true);
      expect(res.state.self.active.hp).toEqual(0);
      expect(res.state.field).toBeTruthy();
    });
  });
});
