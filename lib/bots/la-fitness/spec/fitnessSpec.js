'use strict';

var _fitness = require('la-fitness/src/fitness');

var _fitness2 = _interopRequireDefault(_fitness);

var _pokeutil = require('pokeutil');

var _pokeutil2 = _interopRequireDefault(_pokeutil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Fitness', () => {
  describe('_getMaxDmg', () => {
    it('should research a pokemon if we don\'t know its moves', () => {
      const attacker = _pokeutil2.default.researchPokemonById('hitmonchan');
      const defender = _pokeutil2.default.researchPokemonById('eevee');
      const { bestMove } = _fitness2.default._getMaxDmg(attacker, defender);
      // STAB move with 75 base power. its best.
      expect(bestMove.id).toEqual('drainpunch');
    });
  });
  describe('_getHitsEndured', () => {
    let attacker;
    let defender;
    let move;

    const baseAttacker = {
      hp: 100,
      maxhp: 100,
      statuses: '',
      volatileStatuses: '',
      species: 'eevee'
    };

    const baseDefender = {
      hp: 100,
      maxhp: 100,
      statuses: '',
      volatileStatuses: '',
      species: 'eevee'
    };

    const baseMove = {
      id: 'punch',
      priority: 0
    };

    beforeEach(() => {
      attacker = Object.assign({}, baseAttacker);
      defender = Object.assign({}, baseDefender);
      move = Object.assign({}, baseMove);
    });
    it('should calculate no hits for a fast OHKO move', () => {
      spyOn(_fitness2.default, '_getMaxDmg').and.returnValue({ maxDmg: 100, bestMove: move });
      spyOn(_fitness2.default, '_probablyGoesFirst').and.returnValue(true);
      expect(_fitness2.default._getHitsEndured(attacker, defender)).toEqual(0);
    });
    it('should calculate 1 for a slow OHKO move', () => {
      spyOn(_fitness2.default, '_getMaxDmg').and.returnValue({ maxDmg: 100, bestMove: move });
      spyOn(_fitness2.default, '_probablyGoesFirst').and.returnValue(false);
      expect(_fitness2.default._getHitsEndured(attacker, defender)).toEqual(1);
    });
    it('should calculate 1 for a fast 2HKO move', () => {
      console.log('FAST 2HKO MOVE');
      spyOn(_fitness2.default, '_probablyGoesFirst').and.returnValue(true);
      spyOn(_fitness2.default, '_getMaxDmg').and.returnValue({ maxDmg: 50, bestMove: move });
      expect(_fitness2.default._getHitsEndured(attacker, defender)).toEqual(1);
    });
    it('should calculate 2 for a slow-speed 2HKO move', () => {
      spyOn(_fitness2.default, '_getMaxDmg').and.returnValue({ maxDmg: 50, bestMove: move });
      spyOn(_fitness2.default, '_probablyGoesFirst').and.returnValue(false);
      expect(_fitness2.default._getHitsEndured(attacker, defender)).toEqual(2);
    });
    it('should add 2.1 turns for a frozen attacker', () => {
      spyOn(_fitness2.default, '_getMaxDmg').and.returnValue({ maxDmg: 50, bestMove: move });
      spyOn(_fitness2.default, '_probablyGoesFirst').and.returnValue(false);
      attacker.conditions = 'frz';
      expect(_fitness2.default._getHitsEndured(attacker, defender)).toEqual(4.1);
    });
    it('should add 2 turns for a sleepy attacker', () => {
      spyOn(_fitness2.default, '_getMaxDmg').and.returnValue({ maxDmg: 50, bestMove: move });
      spyOn(_fitness2.default, '_probablyGoesFirst').and.returnValue(false);
      attacker.conditions = 'slp';
      expect(_fitness2.default._getHitsEndured(attacker, defender)).toEqual(4);
    });
    it('should add 25% of turns for a paralyzed attacker', () => {
      spyOn(_fitness2.default, '_getMaxDmg').and.returnValue({ maxDmg: 50, bestMove: move });
      spyOn(_fitness2.default, '_probablyGoesFirst').and.returnValue(false);
      attacker.conditions = 'par';
      expect(_fitness2.default._getHitsEndured(attacker, defender)).toEqual(2.5);
    });
    it('should handle regular poison, 1/8 dmg per turn', () => {
      spyOn(_fitness2.default, '_getMaxDmg').and.returnValue({ maxDmg: 12.5, bestMove: move });
      spyOn(_fitness2.default, '_probablyGoesFirst').and.returnValue(false);
      defender.conditions = 'psn';
      expect(_fitness2.default._getHitsEndured(attacker, defender)).toEqual(4);
    });
    it('should handle a burn, 1/8 dmg per turn', () => {
      spyOn(_fitness2.default, '_getMaxDmg').and.returnValue({ maxDmg: 12.5, bestMove: move });
      spyOn(_fitness2.default, '_probablyGoesFirst').and.returnValue(false);
      defender.conditions = 'brn';
      expect(_fitness2.default._getHitsEndured(attacker, defender)).toEqual(4);
    });
    it('should handle bad poison, kills in 6 turns', () => {
      spyOn(_fitness2.default, '_getMaxDmg').and.returnValue({ maxDmg: 0, bestMove: move });
      spyOn(_fitness2.default, '_probablyGoesFirst').and.returnValue(false);
      defender.conditions = 'tox';
      expect(_fitness2.default._getHitsEndured(attacker, defender)).toEqual(6);
    });

    it('should handle dragonrage', () => {
      const myActive = Object.assign({
        hppct: 90,
        hp: 90,
        maxhp: 100,
        moves: [_pokeutil2.default.researchMoveById('quickattack')],
        active: true
      }, _pokeutil2.default.researchPokemonById('eevee'));
      const yourActive = Object.assign({
        active: true,
        hp: 100,
        maxhp: 100,
        hppct: 100,
        moves: [_pokeutil2.default.researchMoveById('dragonrage')]
      }, _pokeutil2.default.researchPokemonById('steelix'));
      // was really just playing around with this to see what worked. steelix
      // is steel-type so he resists the normal move quickattack
      const atk = _fitness2.default._getHitsEndured(myActive, yourActive);
      expect(atk).toBeGreaterThan(1);
      expect(atk).toBeLessThan(10);

      // absorbs three quick attacks before dealing final blow
      const def = _fitness2.default._getHitsEndured(yourActive, myActive);
      expect(def).toEqual(3);
    });
  });
  describe('partyFitness', () => {
    it('should sum up the hp percents', () => {
      const party = [{ hppct: 50 }, { hppct: 75 }];
      expect(_fitness2.default.partyFitness(party)).toEqual(125);
    });
    it('should punish spikes', () => {
      const party = [{ hppct: 50 }, { hppct: 75 }];
      expect(_fitness2.default.partyFitness(party, { spikes: 1 })).toBeLessThan(125);
    });
  });
  describe('rate', () => {
    let myActive;
    let yourActive;
    let state;
    beforeEach(() => {
      myActive = Object.assign({
        hppct: 50,
        hp: 50,
        maxhp: 100,
        moves: [_pokeutil2.default.researchMoveById('roost'), _pokeutil2.default.researchMoveById('quickattack')]
      }, _pokeutil2.default.researchPokemonById('eevee'));
      yourActive = Object.assign({
        hppct: 50,
        hp: 50,
        maxhp: 100,
        moves: [_pokeutil2.default.researchMoveById('roost'), _pokeutil2.default.researchMoveById('quickattack')]
      }, _pokeutil2.default.researchPokemonById('eevee'));
      state = {
        self: {
          active: myActive,
          reserve: [myActive]
        },
        opponent: {
          active: yourActive,
          reserve: [yourActive]
        }
      };
    });
    it('should know a state is better if I have more health', () => {
      const orig = _fitness2.default.rate(state);

      state.self.active.hppct = 51;
      const updated = _fitness2.default.rate(state);
      expect(updated.summary).toBeGreaterThan(orig.summary);
      expect(updated.myHealth).toBeGreaterThan(orig.myHealth);
    });
    it('should know a state is better if the opponent has less health', () => {
      const orig = _fitness2.default.rate(state);

      state.opponent.active.hppct = 49;
      const updated = _fitness2.default.rate(state);
      expect(updated.summary).toBeGreaterThan(orig.summary);
      expect(updated.yourHealth).toBeLessThan(orig.yourHealth);
    });

    it('should know a state is worse if it has more dead mons', () => {
      const pikachu = {
        species: 'pikachu',
        dead: true
      };
      state.self.reserve.push(pikachu);
      const orig = _fitness2.default.rate(state);

      pikachu.dead = false;
      pikachu.hppct = 100;

      const updated = _fitness2.default.rate(state);
      expect(updated.summary).toBeGreaterThan(orig.summary);
      expect(updated.myHealth).toBeGreaterThan(orig.myHealth);
    });
    it('should favor shorter paths (higher depth) to the state', () => {
      const orig = _fitness2.default.rate(state, 1);
      const updated = _fitness2.default.rate(state, 2);
      expect(updated.summary).toBeGreaterThan(orig.summary);
      expect(updated.depth).toBeGreaterThan(orig.depth);
    });
    it('should favor state where I take fewer turns to kill opponent', () => {
      spyOn(_fitness2.default, '_getHitsEndured').and.returnValues(5, 5);
      const orig = _fitness2.default.rate(state);
      _fitness2.default._getHitsEndured.and.returnValues(4, 5);
      const updated = _fitness2.default.rate(state);
      expect(updated.summary).toBeGreaterThan(orig.summary);
      expect(updated.endurance).toBeLessThan(orig.endurance);
      expect(updated.block).toEqual(orig.block);
    });
    it('should favor state where opponent needs more turns to kill me', () => {
      spyOn(_fitness2.default, '_getHitsEndured').and.returnValues(5, 5);
      const orig = _fitness2.default.rate(state);
      _fitness2.default._getHitsEndured.and.returnValues(5, 6);
      const updated = _fitness2.default.rate(state);
      expect(updated.summary).toBeGreaterThan(orig.summary);
      expect(updated.endurance).toEqual(orig.endurance);
      expect(updated.block).toBeGreaterThan(orig.block);
    });
    it('should favor a situation where I kill someone but am hamed badly', () => {
      state.self.active.hppct = 100;
      const orig = _fitness2.default.rate(state);

      state.self.active.hppct = 5;
      state.opponent.active.dead = true;
      const updated = _fitness2.default.rate(state);
      expect(updated.summary).toBeGreaterThan(orig.summary);
    });
    it('should be indifferent if we do equal damage to each other', () => {
      const orig = _fitness2.default.rate(state);

      state.self.active.hppct = 5;
      state.opponent.active.hppct = 5;
      const updated = _fitness2.default.rate(state);
      expect(updated.summary).toEqual(orig.summary);
    });
  });
});