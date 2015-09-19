import Battle from '../src/battle';
import connection from '../src/connection';

const sampleTurn = {
  "active":[
    {
      "moves":[
        {
          "move":"Fake Out",
          "id":"fakeout",
          "pp":16,
          "maxpp":16,
          "target":"normal",
          "disabled":false
        },
        {
          "move":"Knock Off",
          "id":"knockoff",
          "pp":32,
          "maxpp":32,
          "target":"normal",
          "disabled":false
        },
        {
          "move":"U-turn",
          "id":"uturn",
          "pp":32,
          "maxpp":32,
          "target":"normal",
          "disabled":false
        },
        {
          "move":"Return",
          "id":"return",
          "pp":32,
          "maxpp":32,
          "target":"normal",
          "disabled":false
        }
      ]
    }
  ],
  "side":{
    "name":"5nowden",
    "id":"p1",
    "pokemon":[
      {
        "ident":"p1: Persian",
        "details":"Persian, L83, F",
        "condition":"244/244",
        "active":true,
        "stats":{
          "atk":164,
          "def":147,
          "spa":156,
          "spd":156,
          "spe":239
        },
        "moves":[
          "fakeout",
          "knockoff",
          "uturn",
          "return"
        ],
        "baseAbility":"technician",
        "item":"lifeorb",
        "pokeball":"pokeball",
        "canMegaEvo":false
      },
      {
        "ident":"p1: Wormadam",
        "details":"Wormadam, L83, F",
        "condition":"235/235",
        "active":false,
        "stats":{
          "atk":146,
          "def":189,
          "spa":179,
          "spd":222,
          "spe":107
        },
        "moves":[
          "synthesis",
          "toxic",
          "protect",
          "signalbeam"
        ],
        "baseAbility":"overcoat",
        "item":"leftovers",
        "pokeball":"pokeball",
        "canMegaEvo":false
      },
      {
        "ident":"p1: Malamar",
        "details":"Malamar, L81, F",
        "condition":"289/289",
        "active":false,
        "stats":{
          "atk":196,
          "def":189,
          "spa":157,
          "spd":168,
          "spe":123
        },
        "moves":[
          "trickroom",
          "psychocut",
          "substitute",
          "superpower"
        ],
        "baseAbility":"contrary",
        "item":"leftovers",
        "pokeball":"pokeball",
        "canMegaEvo":false
      },
      {
        "ident":"p1: Basculin-Blue-Stripe",
        "details":"Basculin-Blue-Striped, L83, M",
        "condition":"252/252",
        "active":false,
        "stats":{
          "atk":200,
          "def":156,
          "spa":180,
          "spd":139,
          "spe":210
        },
        "moves":[
          "aquajet",
          "waterfall",
          "crunch",
          "zenheadbutt"
        ],
        "baseAbility":"adaptability",
        "item":"choiceband",
        "pokeball":"pokeball",
        "canMegaEvo":false
      },
      {
        "ident":"p1: Jynx",
        "details":"Jynx, L81, F",
        "condition":"238/238",
        "active":false,
        "stats":{
          "atk":128,
          "def":103,
          "spa":233,
          "spd":201,
          "spe":201
        },
        "moves":[
          "lovelykiss",
          "nastyplot",
          "psychic",
          "icebeam"
        ],
        "baseAbility":"dryskin",
        "item":"leftovers",
        "pokeball":"pokeball",
        "canMegaEvo":false
      },
      {
        "ident":"p1: Liepard",
        "details":"Liepard, L81, F",
        "condition":"236/236",
        "active":false,
        "stats":{
          "atk":189,
          "def":128,
          "spa":189,
          "spd":128,
          "spe":218
        },
        "moves":[
          "substitute",
          "knockoff",
          "encore",
          "copycat"
        ],
        "baseAbility":"prankster",
        "item":"leftovers",
        "pokeball":"pokeball",
        "canMegaEvo":false
      }
    ]
  },
  "rqid":1
};

describe('battle', () => {
  let battle;
  let spy;
  beforeEach( () => {
    battle = new Battle();
    console.log('battle created.', battle);
    spy = jasmine.createSpy('spy');
    spyOn(battle, 'myBot').and.returnValue({
      onRequest: spy
    });
    spyOn(connection, 'send');
  });
  describe('handle', () => {
    it('calls an appropriate function', () => {
      battle.handle('player', ['p1']);
      expect(battle.ord).toEqual('p1');
    });
  });

  describe('handleDamage', () => {
    it('should record damage appropriately', () => {
      battle.allmon['p1: Fakechu'] = {
        hp: 200,
        condition: '200/200'
      };
      battle.handleDamage('p1: Fakechu', '150/200', '[from] Attack');
      expect(battle.allmon['p1: Fakechu'].hp).toEqual(150);
      expect(battle.allmon['p1: Fakechu'].events[0]).toEqual(jasmine.any(Object));
      expect(battle.allmon['p1: Fakechu'].events[0].hplost).toEqual(50);
    });
    it('should panic if it can\'t find the right one', () => {
      battle.allmon['p1: Fakechu'] = {
        hp: 200,
        condition: '200/200'
      };
      const res = battle.handleDamage('sdafkdjnf', '150/200', '[from] Attack');
      expect(res).toBe(false);
    });
  });

  describe('handleSwitch', () => {
    // this is testing processMon pretty hard
    it('handles bizness', () => {
      battle.ord = 'p1';
      battle.handleSwitch('p2a: Slurpuff', 'Slurpuff, L77, M', '100/100');
      expect(battle.activeOpponent).toEqual(jasmine.any(Object));
      expect(battle.activeOpponent.hp).toEqual(100);
      expect(battle.activeOpponent.maxhp).toEqual(100);
      expect(battle.activeOpponent.level).toEqual(77);
    });
    it('skips a pokemon it owns', () => {
      battle.ord = 'p2';
      const res = battle.handleSwitch('p2a: Slurpuff', 'Slurpuff, L77, M', '100/100');
      expect(res).toBe(false);
    });
  });
  describe('handlePlayer', () => {
    it('logs the user\'s ord ID', () => {
      battle.handlePlayer('p1', 'x', 'y');
      expect(battle.ord).toEqual('p1');
    });
  });

  describe('handleRequest', () => {
    it('interprets a mon\'s details', () => {
      battle.handleRequest(JSON.stringify(sampleTurn));
      expect(spy).toHaveBeenCalled();

      const out = spy.calls.argsFor(0)[0];
      expect(out.side.pokemon[0].type).toEqual(jasmine.any(String));
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


