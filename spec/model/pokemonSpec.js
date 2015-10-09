import Pokemon from '../../src/model/pokemon';
import util from '../../src/util';
import log from '../../src/log';

fdescribe('Pokemon', () => {
  // it('should figure out the pokemon owner', () => {
  //   const mon = new Pokemon('p1: Fakechu');
  //   expect(mon.owner).toBe('p1');
  // });
  describe('useDetails', () => {
    let mon;
    beforeEach( () => {
      spyOn(util, 'researchPokemonById').and.returnValue({});
      mon = new Pokemon('fakechu');
    });
    it('should figure out the species', () => {
      mon.useDetails('Fakechu, L83, M');
      expect(mon.species).toEqual('fakechu');
      expect(mon.level).toEqual(83);
      expect(mon.gender).toEqual('M');
    });

    it('should reject malformed details', () => {

    });
  });
  describe('useCondition', () => {
    let mon;
    beforeEach( () => {
      spyOn(util, 'researchPokemonById').and.returnValue({});
      mon = new Pokemon('fakechu');
    });
    it('should parse a healthy condition', () => {
      const cond = '100/100';
      mon.useCondition(cond);
      expect(mon.hp).toEqual(100);
      expect(mon.maxhp).toEqual(100);
      expect(mon.hppct).toEqual(100);
      expect(mon.condition).toEqual(cond);
      expect(mon.conditions.length).toEqual(0);
      expect(mon.dead).toBe(false);
    });

    it('should parse an unhealthy condition', () => {
      const cond = '25/250 par poi';
      mon.useCondition(cond);
      expect(mon.hp).toEqual(25);
      expect(mon.maxhp).toEqual(250);
      expect(mon.hppct).toEqual(10);
      expect(mon.condition).toEqual(cond);
      expect(mon.conditions.length).toEqual(2);
      expect(mon.dead).toBe(false);
    });

    it('should parse death', () => {
      const cond = '0 fnt';
      mon.useCondition(cond);
      expect(mon.hp).toEqual(0);
      expect(mon.maxhp).toEqual(0);
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
    beforeEach( () => {
      spyOn(util, 'researchPokemonById').and.returnValue({});
      mon = new Pokemon('Fakechu');
    });
    it('should return only what is set', () => {
      const cond = '25/250 par poi';
      mon.useCondition(cond);
      const res = mon.data();
      expect(res.condition).toEqual(cond);
      expect(res.conditions.length).toEqual(2);
      expect(res.dead).toBe(undefined);
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
});
