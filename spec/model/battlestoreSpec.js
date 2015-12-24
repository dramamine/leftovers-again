import BattleStore from '../../src/model/battlestore';
import util from '../../src/util';
import Pokemon from '../../src/model/pokemon';
import fakeRequest from '../helpers/request';

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

  // feature removed for the time being
  //
  // describe('event processing', () => {
  //   it('should record a move along with its damage', () => {
  //     const enemy = 'p2a: Hurtachu';
  //     const mon = store._recordIdent(enemy);
  //     mon.useCondition('100/100');
  //     store.handleMove('p1a: Fakechu', 'Hurricane', enemy);
  //     store.handleDamage(enemy, '50/100', null);
  //     expect(store.events.length).toBeGreaterThan(0);
  //     let lastEvent = store.events[store.events.length - 1];
  //     expect(lastEvent.move).toBe('Hurricane');
  //     expect(lastEvent.damage).toBe(50);

  //     // take some poison damage
  //     store.handleDamage(enemy, '25/100', '[from] psn');
  //     // next move
  //     store.handleMove('p1a: Fakechu', 'Rockyoulikea', enemy);
  //     store.handleDamage(enemy, '15/100', null);
  //     expect(store.events.length).toBeGreaterThan(1);
  //     lastEvent = store.events[store.events.length - 1];
  //     expect(lastEvent.move).toBe('Rockyoulikea');
  //     expect(lastEvent.damage).toBe(10);
  //   });

  //   it('should record a move along with its damage', () => {
  //     const enemy = 'p2a: Hurtachu';
  //     const mon = store._recordIdent(enemy);
  //     mon.useCondition('100/100');
  //     store.handleMove('p1a: Fakechu', 'Hurricane', enemy);
  //     store.handleDamage(enemy, '50/100', null);
  //     expect(store.events.length).toBeGreaterThan(0);
  //     expect(store.events[0].move).toBe('Hurricane');
  //     expect(store.events[0].damage).toBe(50);
  //   });
  // });
});

// xdescribe('BattleStore', () => {
//   beforeEach( () => {
//     store = new BattleStore();
//     spyOn(util, 'researchPokemonById').and.returnValue({});
//   });
//   describe('_getOrCreateMon', () => {
//     it('should create a mon if one doesnt exist', () => {
//       store.allmon = [];

//       const ident = 'p1: Fakechu';
//       store._getOrCreateMon('p1: Fakechu');
//       expect(store.allmon[0]).toBeDefined();
//       expect(store.allmon[0].id).toEqual(ident);
//     });
//     it('should return my mon if it already exists', () => {
//       const ident = 'p1: Fakechu';

//       store.allmon = [];

//       const firstPass = store._getOrCreateMon(ident);

//       spyOn(Pokemon, 'constructor');

//       const secondPass = store._getOrCreateMon(ident);

//       expect(firstPass).toEqual(secondPass);
//       expect(Pokemon.constructor).not.toHaveBeenCalled();
//     });
//   });
//   describe('setActive', () => {
//     it('should handle my own pokemon coming in', () => {
//       store.setPlayerId('p1');
//       const guy = store._getOrCreateMon('p1: Fakechu');

//       store.setActive('p1: Fakechu', 'Fakechu, L83, M', '100/100');
//       expect(store.state.self.active.indexOf(guy)).toEqual(0);
//     });
//     it('should handle my opponent\'s pokemon coming in', () => {
//       store.setPlayerId('p1');
//       const guy = store._getOrCreateMon('p2: Fakechu');

//       store.setActive('p2: Fakechu', 'Fakechu, L83, M', '100/100');
//       expect(store.state.opponent.active.indexOf(guy)).toEqual(0);
//     });
//   });
//   describe('handleDamage', () => {
//     it('should save damage events', () => {
//       store.setPlayerId('p1');
//       store.setTurn(1);
//       const guy = store._getOrCreateMon('p1: Fakechu');
//       guy.useCondition('100/100');
//       store.handleDamage('p1a: Fakechu', '50/100', '[from] sadness');
//       expect(guy.events[0].damage).toEqual(50);
//       expect(guy.events[0].from).toEqual('[from] sadness');
//       expect(guy.events[0].turn).toEqual(1);
//     });
//   });
//   describe('interpretRequest', () => {
//     it('should get one active and six reserve pokemons', () => {
//       store.setPlayerId('p1');
//       store.interpretRequest(fakeRequest);
//       console.log('checkin dis:', store.getState().self.active);
//       expect(store.getState().self.active.species).toEqual('persian');
//       expect(store.getState().self.reserve.length).toBe(6);
//       store.interpretRequest(fakeRequest);
//       expect(store.getState().self.active.species).toEqual('persian');
//       expect(store.getState().self.reserve.length).toBe(6);
//     });
//   });

//   // it('should set a player ID', () => {
//   //   const name = 'p1';
//   //   store.setPlayerId(name);
//   //   expect(store.myId).toEqual(name);
//   // });
//   // it('should set a player nickname', () => {
//   //   const name = 'someone';
//   //   store.setPlayerNick(name);
//   //   expect(store.myNick).toEqual(name);
//   // });
// });



// dead code formerly from battleSpec.js

// xdescribe('battle', () => {
//   let battle;
//   let spy;
//   beforeEach( () => {
//     spyOn(console, 'log');
//     spyOn(console, 'error');

//     battle = new Battle();
//     spy = jasmine.createSpy('spy');
//     spyOn(battle, 'myBot').and.returnValue({
//       onRequest: spy
//     });
//   });
//   xdescribe('handle', () => {
//     it('calls an appropriate function', () => {
//       battle.handle('player', ['p1']);
//       expect(battle.ord).toEqual('p1');
//     });
//   });

//   xdescribe('handleDamage', () => {
//     it('should record damage appropriately', () => {
//       battle.allmon['p1: Pikachu'] = {
//         hp: 200,
//         species: 'pikachu',
//         condition: '200/200'
//       };
//       battle.handleDamage('p1: Pikachu', '150/200', '[from] Attack');
//       expect(battle.allmon['p1: Pikachu'].hp).toEqual(150);
//       // expect(battle.allmon['p1: Fakechu'].events[0]).toEqual(jasmine.any(Object));
//       // expect(battle.allmon['p1: Fakechu'].events[0].hplost).toEqual(50);
//     });
//     it('should panic if it can\'t find the right one', () => {
//       battle.allmon['p1: Pikachu'] = {
//         hp: 200,
//         condition: '200/200'
//       };
//       const res = battle.handleDamage('sdafkdjnf', '150/200', '[from] Attack');
//       expect(res).toBe(false);
//     });
//   });

//   xdescribe('handleSwitch', () => {
//     // this is testing processMon pretty hard
//     it('handles bizness', () => {
//       battle.ord = 'p1';
//       battle.handleSwitch('p2a: Slurpuff', 'Slurpuff, L77, M', '100/100');
//       expect(battle.nonRequestState.activeOpponent).toEqual(jasmine.any(Object));
//       expect(battle.nonRequestState.activeOpponent.hp).toEqual(100);
//       expect(battle.nonRequestState.activeOpponent.maxhp).toEqual(100);
//       expect(battle.nonRequestState.activeOpponent.level).toEqual(77);
//     });
//     it('skips a pokemon it owns', () => {
//       battle.ord = 'p2';
//       const res = battle.handleSwitch('p2a: Slurpuff', 'Slurpuff, L77, M', '100/100');
//       expect(res).toBe(false);
//     });
//   });
//   xdescribe('handlePlayer', () => {
//     it('logs the user\'s ord ID', () => {
//       battle.handlePlayer('p1', 'x', 'y');
//       expect(battle.ord).toEqual('p1');
//     });
//   });

//   xdescribe('handleRequest', () => {
//     beforeEach( () => {
//       battle.hasStarted = true;
//     });

//     it('does nothing if the game hasn\'t actually started', () => {
//       battle.hasStarted = false;
//       battle.handleRequest(JSON.stringify(sampleTurn));
//       expect(spy).not.toHaveBeenCalled();
//     });
//     it('interprets a mon\'s details', () => {
//       battle.handleRequest(JSON.stringify(sampleTurn));
//       expect(spy).toHaveBeenCalled();

//       const out = spy.calls.argsFor(0)[0];
//       expect(out.side.pokemon[0].types).toEqual(jasmine.any(Array));
//       expect(out.side.pokemon[0].level).toEqual(jasmine.any(Number));
//       expect(out.side.pokemon[0].gender).toEqual(jasmine.any(String));
//       expect(out.side.pokemon[0].hp).toEqual(jasmine.any(Number));
//       expect(out.side.pokemon[0].maxhp).toEqual(jasmine.any(Number));
//     });

//     it('calls dead pokemons dead', () => {
//       sampleTurn.side.pokemon[1].condition = '0 fnt';
//       battle.handleRequest(JSON.stringify(sampleTurn));
//       expect(spy).toHaveBeenCalled();

//       const out = spy.calls.argsFor(0)[0];
//       expect(out.side.pokemon[1].dead).toBe(true);
//       expect(out.side.pokemon[1].hp).toBe(0);
//       expect(out.side.pokemon[1].maxhp).toBe(0);
//     });
//     it('tracks a pokemons conditions', () => {
//       sampleTurn.side.pokemon[1].condition = '10/10 poi par';
//       battle.handleRequest(JSON.stringify(sampleTurn));
//       expect(spy).toHaveBeenCalled();

//       const out = spy.calls.argsFor(0)[0];
//       expect(out.side.pokemon[1].dead).toBe(false);
//       expect(out.side.pokemon[1].hp).toBe(10);
//       expect(out.side.pokemon[1].maxhp).toBe(10);
//       expect(out.side.pokemon[1].conditions).toEqual(['poi', 'par']);
//     });
//     it('rejects a request with no requestId', () => {
//       const requestless = {};
//       Object.assign(requestless, sampleTurn);
//       requestless.rqid = undefined;
//       const res = battle.handleRequest(JSON.stringify(requestless));
//       expect(res).toBe(false);
//     });
//     it('rejects a request with the \'wait\' property', () => {
//       const requestless = {};
//       Object.assign(requestless, sampleTurn);
//       requestless.wait = true;
//       const res = battle.handleRequest(JSON.stringify(requestless));
//       expect(res).toBe(false);
//     });
//   });
// });
