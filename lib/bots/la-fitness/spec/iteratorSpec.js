'use strict';

var _iterator = require('la-fitness/src/iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _nodeReporter = require('la-fitness/src/nodeReporter');

var _nodeReporter2 = _interopRequireDefault(_nodeReporter);

var _pokeutil = require('pokeutil');

var _pokeutil2 = _interopRequireDefault(_pokeutil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('iterator', () => {
  describe('iterate', () => {
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
              spe: 95
            }
          }, _pokeutil2.default.researchPokemonById('eevee'))
        },
        opponent: {
          active: Object.assign({
            hp: 100,
            maxhp: 100,
            boostedStats: {
              spe: 105
            }
          }, _pokeutil2.default.researchPokemonById('meowth'))
        }
      };
      myOptions = [_pokeutil2.default.researchMoveById('waterpulse'), _pokeutil2.default.researchMoveById('swordsdance'), _pokeutil2.default.researchMoveById('toxic')];
      yourOptions = [_pokeutil2.default.researchMoveById('waterpulse'), _pokeutil2.default.researchMoveById('swordsdance'), _pokeutil2.default.researchMoveById('toxic')];
    });
    it('should produce some possibilities', () => {
      const futures = _iterator2.default.iterateSingleThreaded(state, 1, myOptions, yourOptions);
      expect(futures.length).toEqual(4);
      // const total = futures.reduce( (prev, future) => {
      //   return prev + future.chance;
      // }, 0);
      // // 3 move
      // expect(total).toBeCloseTo(3, 0);

      // const doubleswords = futures.filter(({attacker, defender}) => {
      //   return attacker.boosts && attacker.boosts.atk === 2 &&
      //     defender.boosts && defender.boosts.atk === 2;
      // });
      // expect(doubleswords.length).toBe(4);
    });
    xit('should handle possible volatile statuses', () => {
      yourOptions = [_pokeutil2.default.researchMoveById('waterpulse')];
      const futures = _iterator2.default.iterateSingleThreaded(state, 1, myOptions, yourOptions);
      const waterpulses = futures.filter(possibility => {
        return possibility.defender.move.id === 'waterpulse';
      });
      expect(waterpulses.length).toBeGreaterThan(0);
      let noproc = 0;
      let yesproc = 0;
      waterpulses.forEach(waterpulse => {
        // console.log('checkin out vstatus:', waterpulse.attacker.move.id,
        //   waterpulse.attacker.volatileStatus, waterpulse.chance,
        //   waterpulse.attacker.boosts, waterpulse.defender.hp);
        if (waterpulse.attacker.volatileStatus === 'confusion') {
          yesproc += waterpulse.chance;
        } else {
          noproc += waterpulse.chance;
        }
      });
      // console.log('procs:', yesproc, noproc);
      // note that yesproc and noproc add up to 3, because we are making 3
      // different choices, and the 'chance' amounts are all based on which
      // choice we made.
      expect(yesproc * 4).toEqual(noproc);
    });
  });

  describe('_getNextNode', () => {
    const someNodes = [{ evaluated: false, fitness: 0, depth: 1 }, { evaluated: false, fitness: 1, depth: 1 }, { evaluated: false, fitness: -1, depth: 1 }, { evaluated: true, fitness: 0, depth: 1 }];
    it('should return the node with the best fitness', () => {
      const chosen = _iterator2.default._getNextNode(someNodes);
      console.log('this was chosen:', chosen);
      expect(chosen.fitness).toEqual(1);
    });
    it('should not consider nodes that have been evaluated', () => {
      const chosen = _iterator2.default._getNextNode([someNodes[3]]);
      expect(chosen).toEqual(null);
    });
  });

  describe('specific situations', () => {
    describe('nonthreatening opponent', () => {
      it('should roost when it is safe', () => {
        const myActive = Object.assign({
          hppct: 50,
          hp: 50,
          maxhp: 100,
          moves: [_pokeutil2.default.researchMoveById('roost'), _pokeutil2.default.researchMoveById('quickattack')],
          active: true
        }, _pokeutil2.default.researchPokemonById('eevee'));
        const yourActive = Object.assign({
          active: true,
          hppct: 100,
          moves: [_pokeutil2.default.researchMoveById('dragonrage')]
        }, _pokeutil2.default.researchPokemonById('steelix'));
        const state = {
          self: {
            active: myActive,
            reserve: [myActive]
          },
          opponent: {
            active: yourActive,
            reserve: [yourActive]
          }
        };
        // known moves only. normally we'd run opponent through all possible moves.
        const nodes = _iterator2.default.iterateSingleThreaded(state, 1, state.self.active.moves, state.opponent.active.moves);
        const futures = nodes.filter(node => node.myChoice && node.terminated).sort((a, b) => b.fitness - a.fitness); // highest fitness first
        const future = futures[0];
        console.log(futures[0].myChoice.id, futures[0].fitness, futures[0].fitnessDetails);
        console.log(futures[1].myChoice.id, futures[1].fitness, futures[1].fitnessDetails);
        expect(future.myChoice.id).toEqual('roost');

        // switching gears: we're at full health. don't choose to heal.
        future.state.self.active.hp = 100;
        future.state.self.active.hppct = 100;
        const next = _iterator2.default.iterateSingleThreaded(future.state, 1, future.state.self.active.moves, future.state.opponent.active.moves);
        const nexts = next.filter(node => node.myChoice && node.terminated).sort((a, b) => b.fitness - a.fitness); // highest fitness first
        const nextChoice = nexts[0];
        console.log(nexts[0].myChoice.id, nexts[0].fitness, nexts[0].fitnessDetails);
        console.log(nexts[1].myChoice.id, nexts[1].fitness, nexts[1].fitnessDetails);
        expect(nextChoice.myChoice.id).toEqual('quickattack');
      });
    });
  });
});