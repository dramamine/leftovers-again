import KO from '../../src/lib/kochance';

describe('KO', () => {
  describe('predictKO', () => {
    it('should predictably handle False Swipe', () => {
      const kochance = KO.predictKO([40], {
        maxhp: 200,
      });
      expect(kochance.turns).toBe(5);
      expect(kochance.chance).toBe(100);
    });
    it('should calculate chance correctly', () => {
      const kochance = KO.predictKO([0, 100], {
        maxhp: 200,
      });
      expect(kochance.turns).toBe(2);
      expect(kochance.chance).toBe(25);
    });
  });
});
