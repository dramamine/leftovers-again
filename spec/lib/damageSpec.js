import Damage from 'lib/damage';
import util from 'pokeutil';

describe('damage calculator', () => {
  describe('normal moves', () => {
    it('should handle some normal moves', () => {
      // 85 bp
      const bodyslam = Damage.getDamageResult(
        'eevee', 'meowth', 'bodyslam');
      // 120 bp
      const doubleedge = Damage.getDamageResult(
        'eevee', 'meowth', 'doubleedge');

      expect(bodyslam[0]).toBeLessThan(doubleedge[0]);
    });

    it('should do less damage to rock & steel', () => {
      const groundtype = Damage.getDamageResult(
        'eevee', 'muk', 'bodyslam');
      const rocktype = Damage.getDamageResult(
        'eevee', 'geodude', 'bodyslam');
      const steeltype = Damage.getDamageResult(
        'eevee', 'klang', 'bodyslam');

      expect(rocktype[0]).toBeLessThan(groundtype[0]);
      expect(steeltype[0]).toBeLessThan(groundtype[0]);
    });

    it('should do NO damage to ghost types', () => {
      const ghosttype = Damage.getDamageResult(
        'eevee', 'gengar', 'bodyslam');

      expect(ghosttype[0]).toEqual(0);
      expect(ghosttype[ghosttype.length - 1]).toEqual(0);
    });
  });
  describe('boosts', () => {
    it('should handle +1 boosted attack', () => {
      const attacker = util.researchPokemonById('eevee');

      const boosted = Object.assign({}, attacker);
      boosted.stats = {};
      boosted.level = 75;
      Damage._assumeStat(boosted, 'atk');
      boosted.boosts = {atk: 1};

      const raw = Object.assign({}, attacker);
      raw.stats = {};
      raw.level = 75;
      Damage._assumeStat(raw, 'atk');
      raw.stats.atk = raw.stats.atk * 1.5;
      const boostedDmg = Damage.getDamageResult(boosted, 'geodude', 'bodyslam');
      const rawDmg = Damage.getDamageResult(raw, 'geodude', 'bodyslam');
      expect(boostedDmg).toEqual(rawDmg);
    });

    it('should handle +2 boosted attack', () => {
      const attacker = util.researchPokemonById('eevee');

      const boosted = Object.assign({}, attacker);
      boosted.stats = {};
      boosted.level = 75;
      Damage._assumeStat(boosted, 'atk');
      boosted.boosts = {atk: 2};

      const raw = Object.assign({}, attacker);
      raw.stats = {};
      raw.level = 75;
      Damage._assumeStat(raw, 'atk');
      raw.stats.atk = raw.stats.atk * 2;
      const boostedDmg = Damage.getDamageResult(boosted, 'geodude', 'bodyslam');
      const rawDmg = Damage.getDamageResult(raw, 'geodude', 'bodyslam');
      expect(boostedDmg).toEqual(rawDmg);
    });
    it('should handle +2 boosted defense', () => {
      const defender = util.researchPokemonById('eevee');

      const boosted = Object.assign({}, defender);
      boosted.stats = {};
      boosted.level = 75;
      Damage._assumeStat(boosted, 'def');
      boosted.boosts = {def: 2};

      const raw = Object.assign({}, defender);
      raw.stats = {};
      raw.level = 75;
      Damage._assumeStat(raw, 'def');
      raw.stats.def = raw.stats.def * 2;
      const boostedDmg = Damage.getDamageResult('eevee', boosted, 'bodyslam');
      const rawDmg = Damage.getDamageResult('eevee', raw, 'bodyslam');
      expect(boostedDmg).toEqual(rawDmg);
    });
    it('should handle +2 boosted speed', () => {
      const unboosted = util.researchPokemonById('eevee');
      const boosted = Object.assign({}, unboosted);
      boosted.boosts = {spd: 2};
      Damage.calculateStats(unboosted);
      Damage.calculateStats(boosted);

      expect(unboosted.stats.spd * 2).toEqual(boosted.stats.spd);
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
  describe('weather', () => {
    describe('Sunny Day', () => {
      it('should enhance fire moves', () => {
        const sunny = Damage.getDamageResult(
          'eevee', 'meowth', 'overheat', {weather: 'SunnyDay'}, true);
        const cloudy = Damage.getDamageResult(
          'eevee', 'meowth', 'overheat', {weather: 'None'}, true);
        expect(cloudy * 1.5).toBeCloseTo(sunny);
      });
      it('should dehance water moves', () => {
        const sunny = Damage.getDamageResult(
          'meowth', 'meowth', 'hydropump', {weather: 'SunnyDay'}, true);
        const cloudy = Damage.getDamageResult(
          'meowth', 'meowth', 'hydropump', {weather: 'None'}, true);
        expect(cloudy * 0.5).toBeCloseTo(sunny);
      });
    });
  });

  describe('recoil damage', () => {
    it('should kill via explosion', () => {
      const attacker = { maxhp: 69 };
      const defender = {};
      const recoil = Damage.getRecoilDamage(attacker, defender, 'explosion', 0);
      expect(recoil).toEqual(69);
    });
    it('should hurt via 25% recoil damage', () => {
      const attacker = {};
      const defender = {};
      const recoil = Damage.getRecoilDamage(attacker, defender, 'headcharge', 100);
      expect(recoil).toEqual(25);
    });
    it('should hurt via 33% recoil damage', () => {
      const attacker = {};
      const defender = {};
      const recoil = Damage.getRecoilDamage(attacker, defender, 'woodhammer', 100);
      expect(recoil).toEqual(33);
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
      Damage._assumeStat(mon, 'atk', 0);
      expect(mon.stats.atk).toEqual(38);
    });
    it('should get correct results for 252 EVs', () => {
      Damage._assumeStat(mon, 'atk', 252);
      expect(mon.stats.atk).toEqual(38 + 63);
    });
    it('should get correct results for 252 EVs assuming good nature', () => {
      mon.nature = 'brave';
      Damage._assumeStat(mon, 'atk', 252);
      expect(mon.stats.atk).toEqual(Math.floor((38 + 63) * 1.1));
    });
    it('should get correct results for 252 EVs with good nature', () => {
      Damage._assumeStat(mon, 'atk', 252, 1.1);
      expect(mon.stats.atk).toEqual(Math.floor((38 + 63) * 1.1));
    });
    it('should get correct results for 252 EVs assuming bad nature', () => {
      mon.nature = 'calm';
      Damage._assumeStat(mon, 'atk', 252);
      expect(mon.stats.atk).toEqual(Math.floor((38 + 63) * 0.9));
    });
    it('should get correct results for 252 EVs with bad nature', () => {
      Damage._assumeStat(mon, 'atk', 252, 0.9);
      expect(mon.stats.atk).toEqual(Math.floor((38 + 63) * 0.9));
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
    it('should match this poliwrath math I\'m doing' , () => {
      mon.level = 81;
      mon.baseStats = {
        'hp': 90,
        'atk': 95,
        'def': 95,
        'spa': 70,
        'spd': 90,
        'spe': 70,
      }
      Damage._assumeStat(mon, 'hp', 85);
      Damage._assumeStat(mon, 'atk', 85);
      Damage._assumeStat(mon, 'def', 85);
      Damage._assumeStat(mon, 'spa', 85);
      Damage._assumeStat(mon, 'spd', 85);
      Damage._assumeStat(mon, 'spe', 85);
      expect(mon.stats.hp).toBeCloseTo(278);
      expect(mon.stats.atk).toBeCloseTo(201);
      expect(mon.stats.def).toBeCloseTo(201);
      expect(mon.stats.spa).toBeCloseTo(160);
      expect(mon.stats.spd).toBeCloseTo(192);
      expect(mon.stats.spe).toBeCloseTo(160);
    });
  });
});
