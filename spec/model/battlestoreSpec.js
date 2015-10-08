import BattleStore from '../../src/model/battlestore';
import util from '../../src/util';
import Pokemon from '../../src/model/pokemon';
import fakeRequest from '../helpers/request';

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
  describe('handleDamage', () => {
    it('should save damage events', () => {
      store.setPlayerId('p1');
      store.setTurn(1);
      const guy = store._getOrCreateMon('p1: Fakechu');
      guy.useCondition('100/100');
      store.handleDamage('p1a: Fakechu', '50/100', '[from] sadness');
      expect(guy.getState().events[0].damage).toEqual(50);
      expect(guy.getState().events[0].from).toEqual('[from] sadness');
      expect(guy.getState().events[0].turn).toEqual(1);
    });
  });
  describe('interpretRequest', () => {
    it('should get one active and six reserve pokemons', () => {
      store.setPlayerId('p1');
      store.interpretRequest(fakeRequest);
      console.log('checkin dis:', store.getState().self.active);
      expect(store.getState().self.active.species).toEqual('persian');
      expect(store.getState().self.reserve.length).toBe(6);
      store.interpretRequest(fakeRequest);
      expect(store.getState().self.active.species).toEqual('persian');
      expect(store.getState().self.reserve.length).toBe(6);
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
