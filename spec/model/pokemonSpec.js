import Pokemon from '../../src/model/pokemon';
import util from '../../src/util';
import log from '../../src/log';

describe('Pokemon', () => {
  it('should figure out the pokemon owner', () => {
    const mon = new Pokemon('p1: Fakechu');
    expect(mon.owner).toBe('p1');
  });
  describe('useDetails', () => {
    let mon;
    beforeEach( () => {
      mon = new Pokemon('p1: Fakechu');
    });
    it('should figure out the species', () => {
      spyOn(util, 'researchPokemonById').and.returnValue({
        style: 'classy'
      });
      mon.useDetails('Fakechu, L83, M');
      expect(mon.species).toEqual('fakechu');
      expect(mon.level).toEqual(83);
      expect(mon.gender).toEqual('M');
      expect(mon.style).toEqual('classy');
    });

    it('should reject malformed details', () => {

    });
  });
  describe('useCondition', () => {
    let mon;
    beforeEach( () => {
      mon = new Pokemon('p1: Fakechu');
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
      expect(mon.maxhp).toEqual(100);
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
      mon = new Pokemon('p1: Fakechu');
    });
    it('should return only what is set', () => {
      const cond = '25/250 par poi';
      mon.useCondition(cond);
      const res = mon.data();
      console.log(res);
      expect(res.condition).toEqual(cond);
      expect(res.conditions.length).toEqual(2);
      expect(res.dead).toBe(null);
    });
  });
});
