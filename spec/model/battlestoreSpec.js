import BattleStore from 'model/battlestore';
import util from 'pokeutil';

let store;

describe('BattleStore', () => {
  beforeEach( () => {
    store = new BattleStore();
    spyOn(util, 'researchPokemonById').and.returnValue({});
  });

  describe('barn integration', () => {
    beforeEach( () => {
      for (let i = 0; i < 6; i++) {
        const res = store.barn.create('p1: Fakechu');
        res.order = i;
      }
    });
    it('should handle my pokemon fainting', () => {
      store.myId = 'p1';
      const killed = store.barn.findByOrder('p1a: Fakechu', 0);
      killed.active = true;

      store.handleFaint('p1a: Fakechu');

      const res = store.data();
      expect(res.self.active.length).toBe(0);
      expect(res.self.reserve.filter(mon => mon.dead).length).toBe(1);
      expect(res.self.reserve.filter(mon => !mon.dead).length).toBe(5);
    });
  });

  describe('_recordIdent', () => {
    // it('should create an inactive pokemon', () => {
    //   const ident = 'p1: Fakechu';
    //   const mon = store._findOrCreateByIdent(ident);
    //   expect(mon.species).toEqual('fakechu');
    //   expect(mon.owner).toEqual('p1');
    //   expect(mon.position).toBeFalsy();
    // });
    // it('should create an active pokemon', () => {
    //   const ident = 'p1a: Fakechu';
    //   const mon = store._findOrCreateByIdent(ident);
    //   expect(mon.species).toEqual('fakechu');
    //   expect(mon.owner).toEqual('p1');
    //   expect(mon.position).toBe('p1a');
    // });
    // it('should replace an active pokemon', () => {
    //   store._recordIdent('p1a: Fakechu');
    //   const replacement = store._findOrCreateByIdent('p1a: Charmando');
    //   expect(replacement.species).toEqual('charmando');
    //   expect(replacement.owner).toEqual('p1');
    //   expect(replacement.position).toBe('p1a');
    // });
    // it('should handle reserve order', () => {
    //   store.myId = 'p1';
    //   store._findOrCreateByOrder('p1a: Fakechu', 0);
    //   store._findOrCreateByOrder('p1: Fakechu', 1);
    //   const reserve = store.data().self.reserve;
    //   expect(reserve[0].species).toEqual('fakechu');
    //   expect(reserve[1].species).toEqual('fakechu');
    //   expect(reserve.length).toBe(2);
    // });
    // it('should handle 2nd request', () => {
    //   store.myId = 'p1';
    //   store._findOrCreateByOrder('p1a: Fakechu', 0);
    //   store._findOrCreateByOrder('p1a: Fakechu', 0);
    //   const reserve = store.data().self.reserve;
    //   expect(reserve[0].species).toEqual('fakechu');
    //   expect(reserve.length).toBe(1);
    // });
    // it('should handle same species, but one is dead', () => {
    //   store.myId = 'p1';
    //   store._findOrCreateByOrder('p1a: Fakechu', 0);
    //   const nextMon = store._findOrCreateByOrder('p1: Fakechu', 1);
    //   store._findOrCreateByOrder('p1: Fakechu', 2);
    //   store._findOrCreateByOrder('p1: Fakechu', 3);
    //   store._findOrCreateByOrder('p1: Fakechu', 4);
    //   store._findOrCreateByOrder('p1: Fakechu', 5);

    //   store.handleFaint('p1a: Fakechu');
    //   store.handleSwitch('p1a: Fakechu');

    //   const res = store._findOrCreateByOrder('p1a: Fakechu', 0);
    //   expect(res).toEqual(nextMon);
    // });
  });

  describe('_handleSwitch', () => {
    it('should switch into a pokemon we havent seen', () => {
      store.myId = 'p2';
      store.barn.create('p1a: Fakechu');
      store.handleSwitch('p1a: Guardechu', 'Guardechu, L1', '1/1');
      const result = store.data();
      expect(result.opponent.active.species).toEqual('guardechu');
    });
  });
});
