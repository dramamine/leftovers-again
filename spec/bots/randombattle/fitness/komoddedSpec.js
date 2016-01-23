import KO from '../../../../src/bots/randombattle/fitness/komodded';

describe('KOModded', () => {
  describe('_getDistribution', () => {
    it('should get the one I\'m looking for', () => {
      let distro = KO._getDistribution(2, false);
      expect(distro).toEqual({
        'mean': 185,
        'variance': 42.5,
        'sd': 6.519202405202649,
        'hits': 2
      });

      distro = KO._getDistribution(2, true);
      expect(distro).toEqual({
        'mean': 185.53857322314047,
        'variance': 243.75846122665826,
        'sd': 15.6127659697652,
        'hits': 2,
        'nature': true
      });
    });
  });

  describe('_simpleGetKOChance', () => {
    it('should report 0 chance to do too much damage', () => {
      let res = KO._simpleGetKOChance(50, 2, 125);
      expect(res).toEqual(0);

      res = KO._simpleGetKOChance(100, 3, 400);
      expect(res).toEqual(0);
    });
    it('should report 100 chance to do little damage', () => {
      let res = KO._simpleGetKOChance(50, 2, 70);
      expect(res).toEqual(1);

      res = KO._simpleGetKOChance(100, 3, 200);
      expect(res).toEqual(1);
    });
    it('should find a 50% chance if the mean is 200', () => {
      spyOn(KO, '_getDistribution').and.returnValue({mean: 200, variance: 200});
      const res = KO._simpleGetKOChance(100, 2, 200);
      console.log('komodded chance:', res);
      expect(res).toBeCloseTo(0.5, 4);
    });
    it('should have more than a 50% chance if the damage is higher', () => {
      spyOn(KO, '_getDistribution').and.returnValue({mean: 200, variance: 200});
      const res = KO._simpleGetKOChance(105, 2, 200);
      console.log('komodded chance:', res);
      expect(res).toBeGreaterThan(0.5);
    });

  });
});
