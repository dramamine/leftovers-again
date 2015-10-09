import Battle from '../src/battle';
import {MOVE, SWITCH} from '../src/decisions';
import util from '../src/util';

// import sampleRequest from './helpers/request';
import sampleRequest from './helpers/requestb';


fdescribe('battle', () => {
  let battle;
  const exampleState = {
    rqid: 1,
    self: {
      active: {
        moves: [
          {
            name: 'niceone'
          }
        ]
      },
      reserve: [
        {
          species: 'fakemon'
        },
        {
          species: 'fakechu'
        }
      ]
    }
  };
  beforeEach( () => {
    battle = new Battle();
    spyOn(util, 'researchPokemonById').and.returnValue({});
    spyOn(battle.store, 'data').and.returnValue(exampleState);
  });
  it('should format an integer-based move', () => {
    const res = Battle._formatMessage(1, new MOVE(0), exampleState);
    expect(res).toEqual('1|/move 1|1');
  });
  it('should format an object-based move', () => {
    const res = Battle._formatMessage(1,
      new MOVE(exampleState.self.active.moves[0]), exampleState);
    expect(res).toEqual('1|/move 1|1');
  });
  it('should format a name-based move', () => {
    const res = Battle._formatMessage(1,
      new MOVE('niceone'), exampleState);
    expect(res).toEqual('1|/move 1|1');
  });
  it('should format an integer-based switch', () => {
    const res = Battle._formatMessage(1, new SWITCH(0), exampleState);
    expect(res).toEqual('1|/switch 1|1');
  });
  it('should format an object-based switch', () => {
    const res = Battle._formatMessage(1,
      new SWITCH(exampleState.self.reserve[0]), exampleState);
    expect(res).toEqual('1|/switch 1|1');
  });
  it('should format a name-based switch', () => {
    const res = Battle._formatMessage(1,
      new SWITCH('fakemon'), exampleState);
    expect(res).toEqual('1|/switch 1|1');
  });
});

fdescribe('store integration', () => {
  let battle;
  beforeEach( () => {
    spyOn(console, 'log');
    battle = new Battle();
  });
  it('should process an incoming request', () => {
    battle.handleRequest(sampleRequest);
    // make a pokemon active
    battle.handleSwitch('p2a: Gligar');
    const state = battle.store.data();
    expect(state.self.active).toEqual(jasmine.any(Object));
    expect(state.self.reserve.length).toBe(6);
    expect(state.rqid).toBe(1);
    const moves = state.self.active.moves;

    // fields from research
    expect(moves[0].id).toEqual('roost');

    // fields from 'active' array in the request
    expect(moves[0].pp).toEqual(16);
    expect(moves[0].maxpp).toEqual(16);
    expect(moves[0].disabled).toBe(false);
  });
});


xdescribe('battle', () => {
  let battle;
  let spy;
  beforeEach( () => {
    spyOn(console, 'log');
    spyOn(console, 'error');

    battle = new Battle();
    spy = jasmine.createSpy('spy');
    spyOn(battle, 'myBot').and.returnValue({
      onRequest: spy
    });
  });
  describe('handle', () => {
    it('calls an appropriate function', () => {
      battle.handle('player', ['p1']);
      expect(battle.ord).toEqual('p1');
    });
  });

  xdescribe('handleDamage', () => {
    it('should record damage appropriately', () => {
      battle.allmon['p1: Pikachu'] = {
        hp: 200,
        species: 'pikachu',
        condition: '200/200'
      };
      battle.handleDamage('p1: Pikachu', '150/200', '[from] Attack');
      expect(battle.allmon['p1: Pikachu'].hp).toEqual(150);
      // expect(battle.allmon['p1: Fakechu'].events[0]).toEqual(jasmine.any(Object));
      // expect(battle.allmon['p1: Fakechu'].events[0].hplost).toEqual(50);
    });
    it('should panic if it can\'t find the right one', () => {
      battle.allmon['p1: Pikachu'] = {
        hp: 200,
        condition: '200/200'
      };
      const res = battle.handleDamage('sdafkdjnf', '150/200', '[from] Attack');
      expect(res).toBe(false);
    });
  });

  xdescribe('handleSwitch', () => {
    // this is testing processMon pretty hard
    it('handles bizness', () => {
      battle.ord = 'p1';
      battle.handleSwitch('p2a: Slurpuff', 'Slurpuff, L77, M', '100/100');
      expect(battle.nonRequestState.activeOpponent).toEqual(jasmine.any(Object));
      expect(battle.nonRequestState.activeOpponent.hp).toEqual(100);
      expect(battle.nonRequestState.activeOpponent.maxhp).toEqual(100);
      expect(battle.nonRequestState.activeOpponent.level).toEqual(77);
    });
    it('skips a pokemon it owns', () => {
      battle.ord = 'p2';
      const res = battle.handleSwitch('p2a: Slurpuff', 'Slurpuff, L77, M', '100/100');
      expect(res).toBe(false);
    });
  });
  xdescribe('handlePlayer', () => {
    it('logs the user\'s ord ID', () => {
      battle.handlePlayer('p1', 'x', 'y');
      expect(battle.ord).toEqual('p1');
    });
  });

  xdescribe('handleRequest', () => {
    beforeEach( () => {
      battle.hasStarted = true;
    });

    it('does nothing if the game hasn\'t actually started', () => {
      battle.hasStarted = false;
      battle.handleRequest(JSON.stringify(sampleTurn));
      expect(spy).not.toHaveBeenCalled();
    });
    it('interprets a mon\'s details', () => {
      battle.handleRequest(JSON.stringify(sampleTurn));
      expect(spy).toHaveBeenCalled();

      const out = spy.calls.argsFor(0)[0];
      expect(out.side.pokemon[0].types).toEqual(jasmine.any(Array));
      expect(out.side.pokemon[0].level).toEqual(jasmine.any(Number));
      expect(out.side.pokemon[0].gender).toEqual(jasmine.any(String));
      expect(out.side.pokemon[0].hp).toEqual(jasmine.any(Number));
      expect(out.side.pokemon[0].maxhp).toEqual(jasmine.any(Number));
    });

    it('calls dead pokemons dead', () => {
      sampleTurn.side.pokemon[1].condition = '0 fnt';
      battle.handleRequest(JSON.stringify(sampleTurn));
      expect(spy).toHaveBeenCalled();

      const out = spy.calls.argsFor(0)[0];
      expect(out.side.pokemon[1].dead).toBe(true);
      expect(out.side.pokemon[1].hp).toBe(0);
      expect(out.side.pokemon[1].maxhp).toBe(0);
    });
    it('tracks a pokemons conditions', () => {
      sampleTurn.side.pokemon[1].condition = '10/10 poi par';
      battle.handleRequest(JSON.stringify(sampleTurn));
      expect(spy).toHaveBeenCalled();

      const out = spy.calls.argsFor(0)[0];
      expect(out.side.pokemon[1].dead).toBe(false);
      expect(out.side.pokemon[1].hp).toBe(10);
      expect(out.side.pokemon[1].maxhp).toBe(10);
      expect(out.side.pokemon[1].conditions).toEqual(['poi', 'par']);
    });
    it('rejects a request with no requestId', () => {
      const requestless = {};
      Object.assign(requestless, sampleTurn);
      requestless.rqid = undefined;
      const res = battle.handleRequest(JSON.stringify(requestless));
      expect(res).toBe(false);
    });
    it('rejects a request with the \'wait\' property', () => {
      const requestless = {};
      Object.assign(requestless, sampleTurn);
      requestless.wait = true;
      const res = battle.handleRequest(JSON.stringify(requestless));
      expect(res).toBe(false);
    });
  });
});


