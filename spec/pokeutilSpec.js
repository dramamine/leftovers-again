const util = require('@la/pokeutil');

describe('pokeutil', () => {
  describe('boostCombiner', () => {
    it('should add some boosts to nothing', () => {
      expect(util.boostCombiner({}, { atk: 1 })).toEqual({ atk: 1 });
    });
    it('should respect min and maxes', () => {
      expect(util.boostCombiner({ atk: 5 }, { atk: 2 })).toEqual({ atk: 6 });
      expect(util.boostCombiner({ atk: -5 }, { atk: -2 })).toEqual({ atk: -6 });
    });
    it('should preserve other keys', () => {
      expect(util.boostCombiner({ atk: 3 }, { def: 2 })).toEqual({ atk: 3, def: 2 });
    });
  });
  describe('boostMultiplier', () => {
    it('should calculate this stuff how I expect it to', () => {
      expect(util.boostMultiplier(150, 0)).toEqual(150);
      expect(util.boostMultiplier(150, 1)).toEqual(150 * 1.5);
      expect(util.boostMultiplier(150, 2)).toEqual(150 * 2);
      expect(util.boostMultiplier(150, 3)).toEqual(150 * 2.5);
      expect(util.boostMultiplier(150, 4)).toEqual(150 * 3);
      expect(util.boostMultiplier(150, 5)).toEqual(150 * 3.5);
      expect(util.boostMultiplier(150, 6)).toEqual(150 * 4);
      expect(util.boostMultiplier(150, -1)).toEqual(150 / 1.5);
      expect(util.boostMultiplier(150, -2)).toEqual(150 / 2);
      expect(util.boostMultiplier(150, -3)).toEqual(150 / 2.5);
      expect(util.boostMultiplier(150, -4)).toEqual(150 / 3);
      expect(util.boostMultiplier(150, -5)).toEqual(Math.floor(150 / 3.5));
      expect(util.boostMultiplier(150, -6)).toEqual(Math.floor(150 / 4));
    });
  });
});
