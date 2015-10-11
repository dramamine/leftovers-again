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
  });

  describe('_handleSwitch', () => {
    it('should switch into a pokemon we havent seen', () => {
      store.myId = 'p2';
      store._recordIdent('p1a: Fakechu');
      store.handleSwitch('p1a: Guardechu');
      const result = store.data();
      console.log(result.opponent.active);
      expect(result.opponent.active.species).toEqual('guardechu');
    });
  });
});

xdescribe('BattleStore', () => {
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
      expect(store.allmon[0].id).toEqual(ident);
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
      expect(guy.events[0].damage).toEqual(50);
      expect(guy.events[0].from).toEqual('[from] sadness');
      expect(guy.events[0].turn).toEqual(1);
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

  // it('should set a player ID', () => {
  //   const name = 'p1';
  //   store.setPlayerId(name);
  //   expect(store.myId).toEqual(name);
  // });
  // it('should set a player nickname', () => {
  //   const name = 'someone';
  //   store.setPlayerNick(name);
  //   expect(store.myNick).toEqual(name);
  // });
});
