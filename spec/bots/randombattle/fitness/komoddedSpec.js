import KOModded from '../../../../src/bots/randombattle/fitness/komodded';

describe('KOModded', () => {
  describe('_getDistribution', () => {
    it('should get the one I\'m looking for', () => {
      let distro = KOModded._getDistribution(2, false);
      expect(distro).toEqual({
        'mean': 185,
        'variance': 42.5,
        'sd': 6.519202405202649,
        'hits': 2
      });

      distro = KOModded._getDistribution(2, true);
      expect(distro).toEqual({
        'mean': 185.53857322314047,
        'variance': 243.75846122665826,
        'sd': 15.6127659697652,
        'hits': 2,
        'nature': true
      });
    });
  });
});
