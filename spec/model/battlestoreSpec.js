import BattleStore from '../../src/model/battlestore';
import util from '../../src/util';
import Pokemon from '../../src/model/pokemon';

let store;
fdescribe('BattleStore', () => {
  beforeEach( () => {
    store = new BattleStore();
    spyOn(util, 'researchPokemonById').and.returnValue({});
  });
  describe('_getOrCreateMon', () => {
    it('should create a mon if one doesnt exist', () => {
      store.allmon = [];

      const ident = 'p1: Fakechu';
      store._getOrCreateMon('p1: Fakechu');
      expect(store.allmon[0]).toBeDefined();
      expect(store.allmon[0].getState().id).toEqual(ident);
    });
    it('should return my mon if it already exists', () => {
      const ident = 'p1: Fakechu';

      store.allmon = [];

      const firstPass = store._getOrCreateMon(ident);

      spyOn(Pokemon, 'constructor');

      const secondPass = store._getOrCreateMon(ident);

      expect(firstPass).toEqual(secondPass);
      expect(Pokemon.constructor).not.toHaveBeenCalled();
    });
  });
  describe('setActive', () => {
    it('should handle my own pokemon coming in', () => {
      store.setPlayerId('p1');
      const guy = store._getOrCreateMon('p1: Fakechu');

      store.setActive('p1: Fakechu', 'Fakechu, L83, M', '100/100');
      expect(store.state.self.active.indexOf(guy)).toEqual(0);
    });
    it('should handle my opponent\'s pokemon coming in', () => {
      store.setPlayerId('p1');
      const guy = store._getOrCreateMon('p2: Fakechu');

      store.setActive('p2: Fakechu', 'Fakechu, L83, M', '100/100');
      expect(store.state.opponent.active.indexOf(guy)).toEqual(0);
    });
  });

  it('should set a player ID', () => {
    const name = 'p1';
    store.setPlayerId(name);
    expect(store.myid).toEqual(name);
  });
  it('should set a player nickname', () => {
    const name = 'someone';
    store.setPlayerNick(name);
    expect(store.mynick).toEqual(name);
  });
});
