'use strict';

var _pokeutil = require('pokeutil');

var _pokeutil2 = _interopRequireDefault(_pokeutil);

var _turnsimulator = require('la-fitness/src/turnsimulator');

var _turnsimulator2 = _interopRequireDefault(_turnsimulator);

var _damage = require('lib/damage');

var _damage2 = _interopRequireDefault(_damage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('turn simulator', () => {
  // describe('_arrayReducer', () => {
  //   it('should turn objects and arrays of objects into an array of objects', () => {
  //     const attacker = util.researchPokemonById('eevee');
  //     const defender = util.researchPokemonById('meowth');
  //     const possible = [
  //       [
  //         {
  //           attacker,
  //           defender,
  //           chance: 0.125
  //         },
  //         {
  //           attacker,
  //           defender,
  //           chance: 0.125
  //         },
  //       ],
  //       {
  //         attacker,
  //         defender,
  //         chance: 0.5
  //       },
  //       [
  //         {
  //           attacker,
  //           defender,
  //           chance: 0.125
  //         },
  //         {
  //           attacker,
  //           defender,
  //           chance: 0.125
  //         },
  //       ],
  //     ];
  //     const reduced = possible.reduce(TurnSimulator._arrayReducer, []);
  //     expect(reduced.length).toBe(5);
  //   });
  // });
  describe('_applySecondaries', () => {
    it('should handle a self-boosting move', () => {
      const possible = {
        attacker: {},
        defender: {},
        chance: 1
      };
      possible.attacker.move = {
        target: 'self',
        boosts: { atk: 2 }
      };
      const res = _turnsimulator2.default._applySecondaries(possible, possible.attacker.move);
      expect(res[0].attacker.boosts.atk).toEqual(2);
    });

    it('should handle a stat lowering move', () => {
      const possible = {
        attacker: {},
        defender: {},
        chance: 1
      };
      possible.attacker.move = {
        target: 'normal',
        boosts: { atk: -2 }
      };
      const res = _turnsimulator2.default._applySecondaries(possible, possible.attacker.move);
      expect(res[0].defender.boosts.atk).toEqual(-2);
    });

    it('should handle a self-boosting volatile status', () => {
      const possible = {
        attacker: {},
        defender: {},
        chance: 1
      };
      possible.attacker.move = {
        target: 'self',
        volatileStatus: 'awesome'
      };
      const res = _turnsimulator2.default._applySecondaries(possible, possible.attacker.move);
      expect(res[0].attacker.volatileStatus).toBe('awesome');
    });

    it('should handle a volatile status move', () => {
      const possible = {
        attacker: {},
        defender: {},
        chance: 1
      };
      possible.attacker.move = {
        target: 'normal',
        volatileStatus: 'paralysis'
      };
      const res = _turnsimulator2.default._applySecondaries(possible, possible.attacker.move);
      expect(res[0].defender.volatileStatus).toBe('paralysis');
    });

    it('should apply possible effects', () => {
      const possible = {
        attacker: {},
        defender: {},
        chance: 1
      };
      possible.attacker.move = {
        target: 'normal',
        secondary: {
          volatileStatus: 'paralysis',
          chance: 50
        }
      };

      const [noproc, procs] = _turnsimulator2.default._applySecondaries(possible, possible.attacker.move);

      expect(noproc.defender.volatileStatus).toBeUndefined();
      expect(noproc.chance).toBe(0.5);

      expect(procs.defender.volatileStatus).toBe('paralysis');
      expect(procs.chance).toBe(0.5);
    });

    it('should apply status effects', () => {
      const possible = {
        attacker: {},
        defender: {},
        chance: 1
      };
      possible.attacker.move = {
        target: 'status',
        status: 'tox'
      };

      const [res] = _turnsimulator2.default._applySecondaries(possible, possible.attacker.move);

      expect(res.defender.statuses).toEqual(['tox']);
      expect(res.chance).toBe(1);
    });

    it('should apply possible boosts', () => {
      const possible = {
        attacker: {},
        defender: {},
        chance: 1
      };
      possible.attacker.move = {
        target: 'normal',
        secondary: {
          boosts: { atk: -1 },
          chance: 30
        }
      };

      const [noproc, procs] = _turnsimulator2.default._applySecondaries(possible, possible.attacker.move);

      expect(noproc.defender.boosts).toBeUndefined();
      expect(noproc.chance).toBe(0.7);

      expect(procs.defender.boosts.atk).toBe(-1);
      expect(procs.chance).toBe(0.3);
    });

    it('should handle healing moves', () => {
      const possible = {
        attacker: {
          hp: 25,
          maxhp: 100,
          move: {
            heal: [1, 2],
            target: 'self'
          }
        },
        defender: {},
        chance: 1
      };
      const [res] = _turnsimulator2.default._applySecondaries(possible, possible.attacker.move);
      expect(res.attacker.hp).toEqual(75);
    });
    it('should handle drain moves', () => {
      const possible = {
        attacker: {
          hp: 25,
          maxhp: 100,
          move: {
            drain: [1, 2]
          }
        },
        defender: {},
        chance: 1
      };
      const [res] = _turnsimulator2.default._applySecondaries(possible, possible.attacker.move, 100);
      expect(res.attacker.hp).toEqual(75);
    });
  });
  // describe('_normalize', () => {
  //   it('should give equal chance to all things', () => {
  //     const stuff = [{}, {}, {}, {}];
  //     TurnSimulator._normalize(stuff);
  //     expect(stuff[0].chance).toEqual(0.25);
  //     expect(stuff[1].chance).toEqual(0.25);
  //     expect(stuff[2].chance).toEqual(0.25);
  //     expect(stuff[3].chance).toEqual(0.25);
  //   });
  //   it('should subtract an existing chance', () => {
  //     const stuff = [{chance: 0.4}, {}, {}];
  //     TurnSimulator._normalize(stuff);
  //     expect(stuff[0].chance).toEqual(0.4);
  //     expect(stuff[1].chance).toEqual(0.3);
  //     expect(stuff[2].chance).toEqual(0.3);
  //   });
  // });
  describe('_simulateMove', () => {
    let attacker;
    let defender;
    beforeEach(() => {
      attacker = _pokeutil2.default.researchPokemonById('eevee');
      defender = _pokeutil2.default.researchPokemonById('meowth');
    });
    it('should handle boring damage', () => {
      attacker.move = _pokeutil2.default.researchMoveById('dragonrage');
      const assumptions = {
        level: 50,
        hp: 100,
        maxhp: 100
      };
      Object.assign(attacker, assumptions);
      Object.assign(defender, assumptions);
      const res = _turnsimulator2.default._simulateMove({
        attacker,
        defender
      });
      // min dmg
      expect(res[0].defender.hp).toEqual(60);
      // max dmg
      expect(res[1].defender.hp).toEqual(60);
    });
    it('should handle likely death', () => {
      attacker.move = _pokeutil2.default.researchMoveById('dragonrage');
      const assumptions = {
        level: 50,
        hp: 40,
        maxhp: 100
      };
      Object.assign(attacker, assumptions);
      Object.assign(defender, assumptions);
      const res = _turnsimulator2.default._simulateMove({
        attacker,
        defender
      });
      // min dmg
      expect(res[0].defender.hp).toEqual(0);
    });
    it('should handle possible death', () => {
      attacker.move = _pokeutil2.default.researchMoveById('waterpulse');
      const assumptions = {
        level: 50,
        hp: 100,
        maxhp: 100
      };
      Object.assign(attacker, assumptions);
      Object.assign(defender, assumptions);
      const possibilities = _turnsimulator2.default._simulateMove({
        attacker,
        defender
      });
      // two distinct HPs.
      const hps = new Set();
      possibilities.forEach(res => hps.add(res.defender.hp));
      expect(hps.size).toEqual(2);
    });
  });
  describe('simulate', () => {
    let state;
    beforeEach(() => {
      const mine = Object.assign({
        hp: 78,
        maxhp: 100
      }, _pokeutil2.default.researchPokemonById('eevee'));
      const yours = Object.assign({
        hp: 91,
        maxhp: 100
      }, _pokeutil2.default.researchPokemonById('meowth'));
      state = {
        self: {
          active: mine
        },
        opponent: {
          active: yours
        }
      };
    });
    it('should produce results', () => {
      spyOn(_damage2.default, 'goesFirst').and.returnValue(false);
      const myMove = _pokeutil2.default.researchMoveById('dragonrage');
      const yourMove = _pokeutil2.default.researchMoveById('dragonrage');
      const res = _turnsimulator2.default.simulate(state, myMove, yourMove);
      // all these possibilities are equal and have a 25% chance. there are
      // four possibilities bc each move does either low or high damage, but
      // with this move, it's simpler bc the move always does 40 damage.
      expect(res.length).toEqual(4);
      expect(res[0].chance).toEqual(0.25);
      expect(res[3].chance).toEqual(0.25);
      expect(res[0].state.self.active.hp).toEqual(38);
      expect(res[3].state.self.active.hp).toEqual(38);
      expect(res[0].state.opponent.active.hp).toEqual(51);
      expect(res[3].state.opponent.active.hp).toEqual(51);

      expect(res[0].state.self.active.species).toEqual('Eevee');
      expect(res[0].state.opponent.active.species).toEqual('Meowth');
      expect(res[3].state.self.active.species).toEqual('Eevee');
      expect(res[3].state.opponent.active.species).toEqual('Meowth');
    });
    it('should not swap mine and yours', () => {
      spyOn(_damage2.default, 'goesFirst').and.returnValue(true);
      const myMove = _pokeutil2.default.researchMoveById('dragonrage');
      const yourMove = _pokeutil2.default.researchMoveById('dragonrage');
      const res = _turnsimulator2.default.simulate(state, myMove, yourMove);
      expect(res.length).toEqual(4);
      expect(res[0].state.self.active.species).toEqual('Eevee');
      expect(res[0].state.self.active.hp).toEqual(38);
      expect(res[0].state.opponent.active.species).toEqual('Meowth');
      expect(res[0].state.opponent.active.hp).toEqual(51);
      expect(res[3].state.self.active.species).toEqual('Eevee');
      expect(res[3].state.self.active.hp).toEqual(38);
      expect(res[3].state.opponent.active.species).toEqual('Meowth');
      expect(res[3].state.opponent.active.hp).toEqual(51);
    });
    it('should handle me switching out', () => {
      console.log('HEAR ME OUT>> ');
      console.log(state);
      const myMove = _pokeutil2.default.researchPokemonById('mew');
      myMove.hp = 100;
      myMove.maxhp = 100;
      myMove.hppct = 100;
      const yourMove = _pokeutil2.default.researchMoveById('dragonrage');
      const res = _turnsimulator2.default.simulate(state, myMove, yourMove);
      expect(res[0].state.self.active.species).toEqual('Mew');
      expect(res[0].state.self.active.hp).toEqual(60);
      expect(res[0].state.opponent.active.species).toEqual('Meowth');
      expect(res[0].state.opponent.active.hp).toEqual(91);
    });
    it('should handle you switching out', () => {
      const myMove = _pokeutil2.default.researchMoveById('dragonrage');
      const yourMove = _pokeutil2.default.researchPokemonById('mewtwo');
      yourMove.hp = 100;
      yourMove.maxhp = 100;
      yourMove.hppct = 100;
      const res = _turnsimulator2.default.simulate(state, myMove, yourMove);
      expect(res[0].state.self.active.species).toEqual('Eevee');
      expect(res[0].state.self.active.hp).toEqual(78);
      expect(res[0].state.opponent.active.species).toEqual('Mewtwo');
      expect(res[0].state.opponent.active.hp).toEqual(60);
    });
    it('should handle us switching out', () => {
      const myMove = _pokeutil2.default.researchPokemonById('klefki');
      const yourMove = _pokeutil2.default.researchPokemonById('charmander');
      const res = _turnsimulator2.default.simulate(state, myMove, yourMove);
      expect(res[0].state.self.active.species).toEqual('Klefki');
      expect(res[0].state.opponent.active.species).toEqual('Charmander');
    });
    it('should handle fakeout', () => {
      // fakeout goes first
      // opponent always flinches.
      // expect opponent to take damage and I'm scott-free.
      spyOn(_damage2.default, 'goesFirst').and.returnValue(true);
      const myMove = _pokeutil2.default.researchMoveById('fakeout');
      const yourMove = _pokeutil2.default.researchMoveById('surf');
      const res = _turnsimulator2.default.simulate(state, myMove, yourMove);
      expect(res[0].state.self.active.hp).toEqual(78);
      expect(res[0].state.opponent.active.hp).toBeLessThan(91);
    });
    it('should update the active moves array for switching out', () => {
      const myMove = _pokeutil2.default.researchPokemonById('klefki');
      myMove.moves = ['earthquake'];
      const yourMove = _pokeutil2.default.researchPokemonById('charmander');
      const res = _turnsimulator2.default.simulate(state, myMove, yourMove);
      expect(res[0].state.self.active.species).toEqual('Klefki');
      expect(res[0].state.self.active.moves.length).toEqual(1);
      console.log(res[0].state.self.active.moves);
      expect(res[0].state.self.active.moves[0].id).toEqual('earthquake');
      expect(res[0].state.opponent.active.species).toEqual('Charmander');
    });
  });

  describe('updateMoves', () => {
    const mine = {
      moves: [{
        id: 'splash',
        pp: 20
      }, {
        id: 'waterfall',
        pp: 20
      }],
      item: ''
    };

    it('should subtract one pp', () => {
      const res = _turnsimulator2.default.updateMoves(mine, 'splash');
      expect(res.find(move => move.id === 'splash').pp).toEqual(19);
    });
    it('should subtract final pp', () => {
      mine.moves.find(move => move.id === 'splash').pp = 1;
      const res = _turnsimulator2.default.updateMoves(mine, 'splash');
      expect(res.find(move => move.id === 'splash').pp).toEqual(0);
      expect(res.find(move => move.id === 'splash').disabled).toBe(true);
    });
    it('should handle choice items', () => {
      mine.moves.push({
        id: 'icebeam',
        pp: 20
      });
      mine.item = 'choice band';
      const res = _turnsimulator2.default.updateMoves(mine, 'icebeam');
      expect(res.find(move => move.id === 'icebeam').disabled).toBeFalsy();
      expect(res.find(move => move.id === 'waterfall').disabled).toBe(true);
      expect(res.find(move => move.id === 'splash').disabled).toBe(true);
    });
  });

  // story time:
  // I am slightly faster than my opponent.
  // my best strategy is to cast swords dance, then water pulse. this will kill
  // the opponent and leave me sitting with +2 attack, and only endure one
  // attack from my opponent.
  // after one turn casting swords dance, I should notice that my endurance is
  // 0.
  // my opponent has toxic with Prankster, so he should cast some non-lethal
  // attack move the first turn and cast Prankster the second turn.
  // (this will require foresight for 2 turns, understanding of Prankster, and
  // understanding the value of status moves.)
  xdescribe('compare', () => {
    let state;
    let myOptions;
    let yourOptions;
    beforeEach(() => {
      state = {
        self: {
          active: Object.assign({
            hp: 100,
            maxhp: 100,
            boostedStats: {
              spe: 105
            }
          }, _pokeutil2.default.researchPokemonById('eevee'))
        },
        opponent: {
          active: Object.assign({
            hp: 100,
            maxhp: 100,
            boostedStats: {
              spe: 95
            }
          }, _pokeutil2.default.researchPokemonById('meowth'))
        }
      };
      myOptions = [_pokeutil2.default.researchMoveById('waterpulse'), _pokeutil2.default.researchMoveById('swordsdance'), _pokeutil2.default.researchMoveById('toxic')];
      yourOptions = [_pokeutil2.default.researchMoveById('swordsdance')];
    });
    xit('should produce some possibilities', () => {
      const futures = _turnsimulator2.default.iterate(state, myOptions, yourOptions);
      const comparison = _turnsimulator2.default.compare(futures);
      console.log(comparison);
    });
  });
});