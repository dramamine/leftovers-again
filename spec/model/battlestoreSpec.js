import BattleStore from 'model/battlestore';
import util from 'pokeutil';

let store;

describe('BattleStore', () => {
  beforeEach( () => {
    store = new BattleStore();
    spyOn(util, 'researchPokemonById').and.returnValue({});
  });
  describe('_recordIdent', () => {
    it('should create an inactive pokemon', () => {
      const ident = 'p1: Fakechu';
      const mon = store._recordIdent(ident);
      expect(mon.species).toEqual('fakechu');
      expect(mon.owner).toEqual('p1');
      expect(mon.position).toBeFalsy();
    });
    it('should create an active pokemon', () => {
      const ident = 'p1a: Fakechu';
      const mon = store._recordIdent(ident);
      expect(mon.species).toEqual('fakechu');
      expect(mon.owner).toEqual('p1');
      expect(mon.position).toBe('p1a');
    });
    it('should replace an active pokemon', () => {
      store._recordIdent('p1a: Fakechu');
      const replacement = store._recordIdent('p1a: Charmando');
      expect(replacement.species).toEqual('charmando');
      expect(replacement.owner).toEqual('p1');
      expect(replacement.position).toBe('p1a');
    });
    it('should handle reserve order', () => {
      store.myId = 'p1';
      store._recordIdent('p1a: Fakechu', 0);
      store._recordIdent('p1: Fakechu', 1);
      const reserve = store.data().self.reserve;
      expect(reserve[0].species).toEqual('fakechu');
      expect(reserve[1].species).toEqual('fakechu');
      expect(reserve.length).toBe(2);
    });
    it('should handle 2nd request', () => {
      store.myId = 'p1';
      store._recordIdent('p1a: Fakechu', 0);
      store._recordIdent('p1a: Fakechu', 0);
      const reserve = store.data().self.reserve;
      expect(reserve[0].species).toEqual('fakechu');
      expect(reserve.length).toBe(1);
    });
  });

  describe('_handleSwitch', () => {
    it('should switch into a pokemon we havent seen', () => {
      store.myId = 'p2';
      store._recordIdent('p1a: Fakechu');
      store.handleSwitch('p1a: Guardechu', 'Guardechu, L1', '1/1');
      const result = store.data();
      expect(result.opponent.active.species).toEqual('guardechu');
    });
  });
});
