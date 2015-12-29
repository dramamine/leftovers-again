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
  describe('_getNatureMultiplier', () => {
    it('should return 1 if nature is falsy', () => {
      expect(Damage._getNatureMultiplier(false, 'atk')).toBe(1);
      expect(Damage._getNatureMultiplier(undefined, 'atk')).toBe(1);
      expect(Damage._getNatureMultiplier(null, null)).toBe(1);
    });
    it('should return 1 if nature is invalid', () => {
      spyOn(console, 'log');
      expect(Damage._getNatureMultiplier('dopey', 'atk')).toBe(1);
    });
    it('should give 10% boosts to boosted stats', () => {
      expect(Damage._getNatureMultiplier('adamant', 'atk')).toBe(1.1);
      expect(Damage._getNatureMultiplier('naughty', 'atk')).toBe(1.1);
      expect(Damage._getNatureMultiplier('impish', 'def')).toBe(1.1);
    });
    it('should give 10% unboosts to unboosted stats', () => {
      expect(Damage._getNatureMultiplier('adamant', 'spa')).toBe(0.9);
      expect(Damage._getNatureMultiplier('naughty', 'spd')).toBe(0.9);
      expect(Damage._getNatureMultiplier('lonely', 'def')).toBe(0.9);
    });
    it('should return 1 for neutral stats', () => {
      expect(Damage._getNatureMultiplier('bashful', 'atk')).toBe(1);
      expect(Damage._getNatureMultiplier('bashful', 'def')).toBe(1);
      expect(Damage._getNatureMultiplier('hardy', 'spa')).toBe(1);
      expect(Damage._getNatureMultiplier('quirky', 'spd')).toBe(1);
      expect(Damage._getNatureMultiplier('serious', 'spe')).toBe(1);
    });
  });
  describe('_assumeStat', () => {
    const base = {
      stats: {},
      baseStats: {
        atk: 1,
        hp: 1
      },
      level: 100
    };
    let mon;
    beforeEach( () => {
      mon = {};
      Object.assign(mon, base);
      mon.stats = {}; // don't know why I have to do this, but I do
    });
    it('should get correct results for 0 EVs', () => {
      Damage._assumeStat(mon, 'atk');
      expect(mon.stats.atk).toEqual(38);
    });
    it('should get correct results for 252 EVs', () => {
      Damage._assumeStat(mon, 'atk', 252);
      expect(mon.stats.atk).toEqual(38 + 63);
    });
    it('should get correct results for 252 EVs assuming good nature', () => {
      mon.nature = 'brave';
      Damage._assumeStat(mon, 'atk', 252);
      expect(mon.stats.atk).toEqual((38 + 63) * 1.1);
    });
    it('should get correct results for 252 EVs with good nature', () => {
      Damage._assumeStat(mon, 'atk', 252, 1.1);
      expect(mon.stats.atk).toEqual((38 + 63) * 1.1);
    });
    it('should get correct results for 252 EVs assuming bad nature', () => {
      mon.nature = 'calm';
      Damage._assumeStat(mon, 'atk', 252);
      expect(mon.stats.atk).toEqual((38 + 63) * 0.9);
    });
    it('should get correct results for 252 EVs with bad nature', () => {
      Damage._assumeStat(mon, 'atk', 252, 0.9);
      expect(mon.stats.atk).toEqual((38 + 63) * 0.9);
    });
    it('should get base HP for 0 EVs', () => {
      Damage._assumeStat(mon, 'hp', 0);
      expect(mon.stats.hp).toEqual(33 + 100 + 10);
    });
    it('should get base HP for 252 EVs', () => {
      Damage._assumeStat(mon, 'hp', 252);
      expect(mon.stats.hp).toEqual(33 + 63 + 100 + 10);
    });
    it('should get base HP for a lower level', () => {
      mon.level = 50;
      Damage._assumeStat(mon, 'hp', 252);
      expect(mon.stats.hp).toEqual((33 + 63) * 0.5 + 50 + 10);
    });
  });
});

