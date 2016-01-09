import KO from '../../src/lib/kochance';

fdescribe('KO', () => {
  describe('predictKO', () => {
    it('should predictably handle False Swipe', () => {
      const kochance = KO.predictKO([40], {
        maxHP: 200
      });
      expect(kochance.turns).toBe(5);
      expect(kochance.chance).toBe(100);
    });
  });
});
