import Damage from '../../src/lib/damage';

describe('damage calculator', () => {
  describe('normal moves', () => {
    it('should handle some normal moves', () => {
      // 85 bp
      const bodyslam = Damage.getDamageResult(
        'eevee', 'meowth', 'bodyslam');
      // 120 bp
      const doubleedge = Damage.getDamageResult(
        'eevee', 'meowth', 'doubleedge');

      expect(bodyslam).toBeLessThan(doubleedge);
    });

    it('should do less damage to rock & steel', () => {
      const groundtype = Damage.getDamageResult(
        'eevee', 'muk', 'bodyslam');
      const rocktype = Damage.getDamageResult(
        'eevee', 'geodude', 'bodyslam');
      const steeltype = Damage.getDamageResult(
        'eevee', 'klang', 'bodyslam');

      expect(rocktype).toBeLessThan(groundtype);
      expect(steeltype).toBeLessThan(groundtype);
    });

    it('should do NO damage to ghost types', () => {
      const ghosttype = Damage.getDamageResult(
        'eevee', 'gengar', 'bodyslam');

      expect(ghosttype).toEqual(0);
    });
  });
});

