const Pokemon = require('@la/model/pokemon');
const util = require('@la/pokeutil');
const log = require('@la/log');

log.setLogLevel(1);

describe('Pokemon', () => {
  // it('should figure out the pokemon owner', () => {
  //   const mon = new Pokemon('p1: Fakechu');
  //   expect(mon.owner).toBe('p1');
  // });
  describe('useDetails', () => {
    let mon;
    beforeEach(() => {
      spyOn(util, 'researchPokemonById').and.returnValue({});
      mon = new Pokemon('p1a: Fakechu', 'Fakechu, L83, M');
    });
    it('should figure out the species', () => {
      mon.useDetails('Fakechu, L83, M');
      expect(mon.species).toEqual('Fakechu');
      expect(mon.level).toEqual(83);
      expect(mon.gender).toEqual('M');
    });

    // it('should reject malformed details', () => {

    // });
  });
  describe('useCondition', () => {
    let mon;
    beforeEach(() => {
      spyOn(util, 'researchPokemonById').and.returnValue({});
      mon = new Pokemon('p1a: Fakechu', 'Talonflame, L83, M');
    });
    it('should parse a healthy condition', () => {
      const cond = '100/100';
      mon.useCondition(cond);
      expect(mon.hp).toEqual(100);
      expect(mon.maxhp).toEqual(100);
      expect(mon.hppct).toEqual(100);
      expect(mon.condition).toEqual(cond);
      expect(mon.statuses.length).toEqual(0);
      expect(mon.dead).toBe(undefined);
    });

    it('should parse an unhealthy condition', () => {
      const cond = '25/250 par poi';
      mon.useCondition(cond);
      expect(mon.hp).toEqual(25);
      expect(mon.maxhp).toEqual(250);
      expect(mon.hppct).toEqual(10);
      expect(mon.condition).toEqual(cond);
      expect(mon.statuses.length).toEqual(2);
      expect(mon.dead).toBe(undefined);
    });

    it('should parse death', () => {
      const cond = '0 fnt';
      mon.useCondition(cond);
      expect(mon.hp).toEqual(0);
      expect(mon.hppct).toEqual(0);
      expect(mon.dead).toBe(true);
    });

    it('should reject malformed conditions', () => {
      spyOn(log, 'error');
      mon.useCondition('100');
      expect(log.error).toHaveBeenCalled();
    });

    it('should reject malformed conditions', () => {
      spyOn(log, 'error');
      mon.useCondition('sdajio fds');
      expect(log.error).toHaveBeenCalled();
    });

    it('should reject malformed conditions', () => {
      spyOn(log, 'error');
      mon.useCondition('100 ');
      expect(log.error).toHaveBeenCalled();
    });
  });
  describe('data', () => {
    let mon;
    beforeEach(() => {
      spyOn(util, 'researchPokemonById').and.returnValue({});
      mon = new Pokemon('p1a: Fakechu', 'Talonflame, L83, M');
    });
    it('should return only what is set', () => {
      const cond = '25/250 par poi';
      mon.useCondition(cond);
      const res = mon.data();
      expect(res.condition).toEqual(cond);
      expect(res.statuses.length).toEqual(2);
      expect(res.dead).toBe(undefined);
    });
  });
  describe('stat handling', () => {
    it('should process boosted stats', () => {
      spyOn(util, 'researchPokemonById').and.returnValue({
        stats: { atk: 100 },
        boosts: { atk: 2 }
      });
      const mon = new Pokemon('p1a: Fakechu', 'Talonflame, L83, M');
      const res = mon.data();
      expect(res.stats.atk).toEqual(100);
      expect(res.boosts.atk).toEqual(2);
      expect(res.boostedStats.atk).toEqual(200);
    });
  });
  describe('updateMoveList', () => {
    const list = ['roost', 'fakeout', 'hiddenpowerice'];
    const moves = Pokemon.updateMoveList(list);
    it('should research all my moves', () => {
      // roost doesn't have power
      expect(moves[0].basePower).toBe(undefined);
      expect(moves[1].basePower).toEqual(jasmine.any(Number));
      expect(moves[2].basePower).toEqual(jasmine.any(Number));

      expect(moves[0].accuracy).toBe(true);
      expect(moves[1].accuracy).toEqual(jasmine.any(Number));
      expect(moves[2].accuracy).toEqual(jasmine.any(Number));

      expect(moves[0].category).toEqual(jasmine.any(String));
      expect(moves[1].category).toEqual(jasmine.any(String));
      expect(moves[2].category).toEqual(jasmine.any(String));

      expect(moves[0].type).toEqual(jasmine.any(String));
      expect(moves[1].type).toEqual(jasmine.any(String));
      expect(moves[2].type).toEqual(jasmine.any(String));
    });
  });
  describe('recordMove', () => {
    it('should record moves used', () => {
      const mon = new Pokemon('p1a: Fakechu', 'Talonflame, L83, M');
      mon.recordMove('surf');
      mon.recordMove('waterfall');
      mon.recordMove('surf');
      mon.recordMove('thunderbolt');
      expect(mon.prevMoves).toEqual(['thunderbolt', 'surf', 'waterfall', 'surf']);
      expect(mon.seenMoves).toContain('surf');
      expect(mon.seenMoves).toContain('waterfall');
      expect(mon.seenMoves).toContain('thunderbolt');
      expect(mon.seenMoves.length).toEqual(3);
    });
  });
  describe('useBoost', () => {
    let mon;
    beforeEach(() => {
      spyOn(util, 'researchPokemonById').and.returnValue({});
      mon = new Pokemon('p1a: Fakechu', 'Talonflame, L83, M');
    });
    it('should boost a stat', () => {
      mon.useBoost('atk', 1);
      expect(mon.data().boosts.atk).toEqual(1);

      mon.useBoost('atk', 2);
      expect(mon.data().boosts.atk).toEqual(3);

      mon.useBoost('atk', -3);
      expect(mon.data().boosts.atk).toBe(undefined);
    });

    it('should unboost a stat', () => {
      mon.useBoost('atk', -1);
      expect(mon.data().boosts.atk).toEqual(-1);

      mon.useBoost('atk', -2);
      expect(mon.data().boosts.atk).toEqual(-3);

      mon.useBoost('atk', 3);
      expect(mon.data().boosts.atk).toBe(undefined);
    });

    it('should limit boost level to 6', () => {
      mon.useBoost('atk', -7);
      expect(mon.data().boosts.atk).toEqual(-6);

      mon.useBoost('atk', 13);
      expect(mon.data().boosts.atk).toEqual(6);
    });
  });
});
