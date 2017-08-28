const BattleStore = require('@la/model/battlestore');
const Barn = require('@la/model/pokebarn');
const sampleRequest = require('../helpers/requestc');

let store;

describe('BattleStore', () => {
  beforeEach(() => {
    store = new BattleStore();
    // spyOn(util, 'researchPokemonById').and.returnValue({});
  });

  // describe('barn integration', () => {
  //   beforeEach( () => {
  //     for (let i = 0; i < 6; i++) {
  //       const res = store.barn.create('p1: Fakechu', 'Fakechu, L83, M');
  //       res.order = i;
  //     }
  //   });
  //   // it('should handle my pokemon fainting', () => {
  //   //   store.myId = 'p1';
  //   //   const killed = store.barn.findByOrder(0, 'p1a: Fakechu');
  //   //   killed.active = true;

  //   //   store.handleFaint('p1a: Fakechu');

  //   //   const res = store.data();
  //   //   expect(res.self.active.length).toBe(0);
  //   //   expect(res.self.reserve.filter(mon => mon.dead).length).toBe(1);
  //   //   expect(res.self.reserve.filter(mon => !mon.dead).length).toBe(5);
  //   // });
  // });
  describe('handleRequest', () => {
    it('should set a mon to active', () => {
      store.barn = new Barn();
      store.handleRequest(JSON.stringify(sampleRequest));
      const res = store.data();
      expect(res.self.active).toBeTruthy();
      expect(res.self.reserve.filter(mon => mon.dead).length).toBe(1);
      expect(res.self.reserve.filter(mon => !mon.dead).length).toBe(5);
      expect(res.self.reserve.filter(mon => mon.active).length).toBe(1);
    });
  });

  describe('_handleSwitch', () => {
    it('should switch into a pokemon we havent seen', () => {
      store.myId = 'p2';
      store.barn.create('p1a: Fakechu', 'Fakechu, L83, M');
      store.handleSwitch('p1a: Guardechu', 'Guardechu, L1', '1/1');
      const result = store.data();
      expect(result.opponent.active.species).toEqual('Guardechu');
    });
  });
  describe('handleDetailsChange', () => {
    it('should follow mega-evolution', () => {
      store.myId = 'p1';
      // p2a: Charizard|Charizard-Mega-X, M
      store.barn.create('p1a: Charzizzy', 'Charizard, L83, M');
      store.handleDetailsChange('p1a: Charzizzy', 'Charizard-Mega-X, M');
      expect(store.barn.find('p1: Charzizzy')).toBeTruthy();
    });
  });
});
