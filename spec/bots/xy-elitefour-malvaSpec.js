const Elite = require('@la/bots/elitefour/xy-malva');
const util = require('@la/pokeutil');

const elite = new Elite();

const moves = [
  { move: 'Hyper Voice', id: 'hypervoice', disabled: false },
  { move: 'Noble Roar', id: 'nobleroar', disabled: false },
  { move: 'Flamethrower', id: 'flamethrower', disabled: false },
  { move: 'Wild Charge', id: 'wildcharge', disabled: false },
];

moves.forEach((move) => {
  Object.assign(move, util.researchMoveById(move.id));
});

describe('xy-elitefour-malva', () => {
  describe('sumFitness', () => {
    it('handles boolean values', () => {
      elite.weights.thing = {
        weight: 10
      };
      const fit = {
        thing: true
      };
      expect(elite.sumFitness(fit)).toBe(10);
    });
    it('handles functiony values', () => {
      elite.weights.math = {
        weight: 10,
        value: () => 10,
      };
      const fit = {
        math: 10
      };
      expect(elite.sumFitness(fit)).toBe(100);
    });
    it('sums', () => {
      elite.weights.one = {
        weight: 10
      };
      elite.weights.two = {
        weight: 5
      };
      const fit = {
        one: true,
        two: true
      };
      expect(elite.sumFitness(fit)).toBe(15);
    });
  });

  describe('pickMoveByFitness', () => {
    let arr;
    beforeEach(() => {
      arr = {
        cry: 1,
        poke: 10,
        slaughter: 20
      };
    });
    it('should pick a really popular move', () => {
      spyOn(Math, 'random').and.returnValue(0.5);
      expect(elite.pickMoveByFitness(arr)).toEqual('slaughter');
    });
    it('should extremely rarely pick a terrible move', () => {
      spyOn(Math, 'random').and.returnValue(0.0001);
      expect(elite.pickMoveByFitness(arr)).toEqual('cry');
    });
    it('should possibly pick a bad move', () => {
      spyOn(Math, 'random').and.returnValue(0.01);
      expect(elite.pickMoveByFitness(arr)).toEqual('poke');
    });
    it('should never pick a move with negative weight', () => {
      arr.whine = -5;
      spyOn(Math, 'random').and.returnValue(0);
      expect(elite.pickMoveByFitness(arr)).not.toEqual('whine');
    });
    it('should never pick a move with negative weight', () => {
      arr.whine = -5;
      spyOn(Math, 'random').and.returnValue(1);
      expect(elite.pickMoveByFitness(arr)).not.toEqual('whine');
    });
  });
});
