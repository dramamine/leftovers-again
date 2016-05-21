'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _damage = require('lib/damage');

var _damage2 = _interopRequireDefault(_damage);

var _komodded = require('./komodded');

var _komodded2 = _interopRequireDefault(_komodded);

var _pokeutil = require('pokeutil');

var _pokeutil2 = _interopRequireDefault(_pokeutil);

var _log = require('log');

var _log2 = _interopRequireDefault(_log);

var _volatileStatuses = require('constants/volatileStatuses');

var _volatileStatuses2 = _interopRequireDefault(_volatileStatuses);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TurnSimulator {

  /**
   * Take a given state, and simulate what the attacker and defender will look
   * like after these specific choices are made.
   *
   * @param  {Object} state      The state object from a server request.
   * @param  {Object} myChoice   Either a {Move} or a {Pokemon} object.
   * @param  {Object} yourChoice Either a {Move} or a {Pokemon} object.
   * @property {Number} yourChoice.chance  The chance this move will occur, 1
   * otherwise. The sum of the results of this function will add up to this
   * number. Ex. if you call this with a move you think is 20% likely to occur,
   * all the possible outcomes here will sum to 0.2.
   *
   * @return {Array}  An array of 'possibilty' objects. These have the
   * properties 'attacker', 'defender', and 'chance'. You can use attacker.move
   * and defender.move to see which move was performed; if not this, then maybe
   * the Pokemon was switched out?
   */
  simulate(state, myChoice, yourChoice) {
    const mine = _pokeutil2.default.clone(state.self.active);
    const yours = _damage2.default.assumeStats(_pokeutil2.default.clone(state.opponent.active));
    // console.log(`simulating battle btwn ${mine.species} casting ${myChoice.id} and ${yours.species} casting ${yourChoice.id}`);

    if (myChoice.species) {
      mine.switch = myChoice;
      // not sure why I need this :\
      delete mine.move;

      // update moves array. this should always be there, since we know what
      // moves our mon has. but sometimes we don't have it (like for unit tests)
      if (myChoice.moves) {
        _log2.default.debug('since im switching, im also researching these moves.');
        myChoice.moves = myChoice.moves.map(move => {
          if (move.id) return move;
          return _pokeutil2.default.researchMoveById(move);
        });
      }
    } else {
      mine.move = myChoice;
      if (!mine.prevMoves) {
        mine.prevMoves = [];
      }
      mine.prevMoves.unshift(myChoice.id);
    }

    if (yourChoice.species) {
      // console.log('cool, yours is switching');
      yours.switch = yourChoice;
      delete yours.move;
    } else {
      yours.move = yourChoice;
      if (!yours.prevMoves) {
        yours.prevMoves = [];
      }
      yours.prevMoves.unshift(yourChoice.id);
    }

    let mineGoesFirst;
    if (mine.switch) {
      // I am switching out
      mineGoesFirst = true;
      // Log.debug('im first');
    } else if (yours.switch) {
        // you are switching out
        mineGoesFirst = false;
      } else {
        // we are both performing moves
        mineGoesFirst = _damage2.default.goesFirst(mine, yours);
      }

    // Log.debug('mineGoesFirst? ' + mineGoesFirst);

    const first = mineGoesFirst ? mine : yours;
    const second = mineGoesFirst ? yours : mine;

    // first move.
    // afterFirst is an array of [attacker, defender, chance]
    let afterFirst;
    if (first.move) {
      try {
        afterFirst = this._simulateMove({ attacker: first, defender: second });
      } catch (e) {
        _log2.default.error('Something broke. check simulation-errors.out for details.');
        _log2.default.toFile('simulation-errors.out', JSON.stringify(state));
        _log2.default.toFile('simulation-errors.out', JSON.stringify(myChoice));
        _log2.default.toFile('simulation-errors.out', JSON.stringify(yourChoice));
        _log2.default.toFile('simulation-errors.out', JSON.stringify(attacker));
        _log2.default.toFile('simulation-errors.out', JSON.stringify(defender));
        _log2.default.toFile('simulation-errors.out', '\n');
      }
    } else {
      const switched = _pokeutil2.default.clone(first.switch);
      switched.switch = first.species; // ?? to know we switched?
      afterFirst = [{ attacker: switched, defender: second, chance: 1 }];
      // Log.debug('switched! afterFirst is now');
      // Log.debug(afterFirst);
    }

    // Log.debug('after first move, mine is:', afterFirst[0].attacker.species);
    const afterSecond = [];

    afterFirst.forEach(possibility => {
      if (second.dead) {
        const withChance = {
          state: _pokeutil2.default.clone(state),
          chance: possibility.chance
        };
        if (mineGoesFirst) {
          withChance.state.self.active = possibility.attacker;
          withChance.state.opponent.active = possibility.defender;
        } else {
          withChance.state.self.active = possibility.defender;
          withChance.state.opponent.active = possibility.attacker;
        }
        afterSecond.push(withChance);
        return;
      }

      if (second.move) {
        _log2.default.debug('looking at possibility:' + JSON.stringify(possibility));
        // next move.
        // WHOA WATCH OUT FOR THE ATK/DEF SWAP
        let res;
        try {
          res = this._simulateMove({
            attacker: possibility.defender,
            defender: possibility.attacker
          });
        } catch (e) {
          _log2.default.error('Something broke. check simulation-errors.out for details.');
          _log2.default.toFile('simulation-errors.out', JSON.stringify(state));
          _log2.default.toFile('simulation-errors.out', JSON.stringify(myChoice));
          _log2.default.toFile('simulation-errors.out', JSON.stringify(yourChoice));
          _log2.default.toFile('simulation-errors.out', JSON.stringify(possibility));
          _log2.default.toFile('simulation-errors.out', '\n');
        }

        _log2.default.debug('after second move, attacker is:' + res[0].attacker.species);
        _log2.default.debug('attacker hp:' + res[0].attacker.hp);
        _log2.default.debug('defender hp:' + res[0].defender.hp);
        res.forEach(poss => {
          // notice that we convert back from attacker/defender distinction.
          const withChance = {
            state: _pokeutil2.default.clone(state),
            chance: possibility.chance * poss.chance
          };
          // if mine goes first, then it was attacker on first round and defender
          // on second round.
          if (mineGoesFirst) {
            withChance.state.self.active = poss.defender;
            withChance.state.opponent.active = poss.attacker;
          } else {
            withChance.state.self.active = poss.attacker;
            withChance.state.opponent.active = poss.defender;
          }
          afterSecond.push(withChance);
        });
      } else {
        // we both switched out, lawl.
        const switched = second.switch;
        switched.switch = second.species;
        // gotta maybe switch back.
        const withChance = {
          state: _pokeutil2.default.clone(state),
          chance: possibility.chance
        };
        // don't need conditionals here, bc mineGoesFirst is always true.
        // (you can't have a move happen first and a switch happen second)
        withChance.state.self.active = possibility.attacker;
        withChance.state.opponent.active = switched;
        afterSecond.push(withChance);
      }
      // Log.debug('then mine is: ', afterSecond[afterSecond.length - 1].mine.species);
    });
    // Log.debug('afterSecond became:' + JSON.stringify(afterSecond));

    if (!this._verifyTotalChance(afterSecond)) {
      _log2.default.error('got wrong total from simulate');
      _log2.default.error(mine, yours);
      _log2.default.error(afterSecond);
    }

    // remove volatile statuses
    // @TODO this is dangerous/lazy
    if (mine && mine.volatileStatus) mine.volatileStatus = '';
    if (yours && yours.volatileStatus) yours.volatileStatus = '';

    // disable moves and stuff
    if (myChoice.move) {
      mine.moves = this.updateMoves(mine, myChoice.id);
    }
    if (yourChoice.move) {
      yours.moves = this.updateMoves(yours, yourChoice.id);
    }

    return afterSecond;
  }

  /**
   * Update moves to account for the fact that they were used
   * @param  {Object} mon     The pokemon that did the move
   * @param  {String} myChoice The ID of the move made.
   * @return {Array<Move>}   Updated moves
   */
  updateMoves(mon, chosenMove) {
    // our opponents don't have 'moves' bc we don't know at first.
    if (!mon.moves) {
      mon.moves = [];
    }

    // find the part of 'moves' we need to update.
    let chosen = mon.moves.find(move => move.id === chosenMove);

    // handle an opponent coming in with a move we didn't know about
    if (!chosen) {
      const move = _pokeutil2.default.researchMoveById(chosenMove);
      if (!move) {
        _log2.default.error('no move found!' + chosenMove);
        _log2.default.error(chosenMove);
        return [];
      }
      move.pp = 20;
      move.maxpp = 20;
      mon.moves.push(move);
      chosen = move;
    }

    // subtracting pp
    chosen.pp -= 1;
    if (chosen.pp === 0) chosen.disabled = true;

    // choice items disable all other moves
    if (mon.item && mon.item.toLowerCase().indexOf('choice') >= 0) {
      mon.moves.forEach(move => {
        if (move === chosen) return;
        move.disabled = true;
      });
    }

    // fakeout only works on the first turn out.
    if (chosenMove === 'fakeout') {
      chosen.disabled = true;
    }
    return mon.moves;
  }

  // swap(simulation) {
  //   const defender = simulation.defender;
  //   simulation.defender = simulation.attacker;
  //   simulation.attacker = defender;
  //   return simulation;
  // }

  /**
   * Simulates a move by splitting it into possibilities (kills, 100% dmg moves
   * and 85% dmg moves), then further splitting those possibilities by their
   * secondary effects.
   *
   * @param  {[type]} attacker [description]
   * @param  {[type]} defender [description]
   * @param  {[type]} move     [description]
   * @return {[type]}          [description]
   */
  _simulateMove({ attacker, defender }) {
    // Log.debug('simulatemove:', attacker, defender, chance);
    attacker = JSON.parse(JSON.stringify(attacker)); // eslint-disable-line
    defender = JSON.parse(JSON.stringify(defender)); // eslint-disable-line
    const move = attacker.move;

    _log2.default.debug(`${ attacker.species } is casting ${ move.id }`);
    if (!move) {
      return [{
        attacker,
        defender,
        chance: 1
      }];
    }

    // so technically, this really shouldn't be attacked to Pokemon, but since
    // I don't have access to 'state' itself, I gotta just throw this on here.
    if (move.sideCondition) {
      if (move.target === 'allySide') {
        if (!attacker.sideConditions) {
          attacker.sideConditions = [];
        }
        attacker.sideConditions.push(move.sideCondition);
      } else if (move.target === 'foeSide') {
        if (!defender.sideConditions) {
          defender.sideConditions = [];
        }
        defender.sideConditions.push(move.sideCondition);
      } else {
        _log2.default.error('Not sure what to do with this side effect. target was ' + move.target);
        _log2.default.error(move);
      }
    }

    if (attacker.volatileStatus === _volatileStatuses2.default.FLINCH) {
      attacker.volatileStatus = '';
      return [{
        attacker,
        defender,
        chance: 1
      }];
    }

    const dmg = _damage2.default.getDamageResult(attacker, defender, move);
    // Log.debug('using dmg', dmg);
    // const dmg = 40;
    const { koturns, kochance } = _komodded2.default.predictKO(dmg, defender);
    const possible = [];
    if (koturns === 1) {
      possible.push({
        attacker: _pokeutil2.default.clone(attacker),
        defender: this._kill(_pokeutil2.default.clone(defender)),
        chance: kochance
      });
      if (kochance < 1) {
        possible.push({
          attacker: _pokeutil2.default.clone(attacker),
          defender: this._takeDamage(_pokeutil2.default.clone(defender), dmg[0]),
          chance: 1 - kochance
        });
      }
    } else {
      // 50% chance for max damage; 50% chance for min damage.
      possible.push({
        attacker: _pokeutil2.default.clone(attacker),
        defender: this._takeDamage(_pokeutil2.default.clone(defender), dmg[0]),
        chance: 0.5
      });
      possible.push({
        attacker: _pokeutil2.default.clone(attacker),
        defender: this._takeDamage(_pokeutil2.default.clone(defender), dmg[dmg.length - 1]),
        chance: 0.5
      });
    }
    const applied = [];
    possible.forEach(event => {
      // Log.debug('looking at possible:');
      // Log.debug(event.defender.hp, event.chance);
      const maybeProcs = this._applySecondaries(event, move, defender.hp - event.defender.hp);
      maybeProcs.forEach(proc => {
        // Log.debug('looking at proc:', proc.chance);
        const res = {
          attacker: proc.attacker,
          defender: proc.defender,
          chance: proc.chance * event.chance
        };
        // Log.debug(event.chance, proc.chance, res.chance);
        if (res.chance > 0) applied.push(res);
        // Log.debug('just pushed a proc with chance', proc.chance * event.chance);
      });
    });

    if (!this._verifyTotalChance(applied)) {
      _log2.default.error('got wrong total from _simulateMove');
      _log2.default.error(attacker);
      _log2.default.error(defender);
      _log2.default.error(applied);
    }

    return applied;
  }

  /**
   * Apply effects, such as status effects, boosts, unboosts, and volatile
   * statuses.
   *
   * @TODO handle PROTECT and FLINCH
   *
   * @param  {[type]} possible [description]
   * @param  {[type]} move     [description]
   * @return {[type]}          [description]
   */
  _applySecondaries(possible, move, dmg = 0) {
    // handle moves that always boost or unboost
    if (move.boosts) {
      if (move.target === 'self') {
        possible.attacker.boosts = _pokeutil2.default.boostCombiner(possible.attacker.boosts, move.boosts);
      } else {
        possible.defender.boosts = _pokeutil2.default.boostCombiner(possible.defender.boosts, move.boosts);
      }
    }

    if (move.heal) {
      possible.attacker.hp = Math.min(possible.attacker.maxhp, possible.attacker.hp + possible.attacker.maxhp * move.heal[0] / move.heal[1]);
      possible.attacker.hppct = 100 * possible.attacker.hp / possible.attacker.maxhp;
    }

    if (move.drain) {
      possible.attacker.hp = Math.min(possible.attacker.maxhp, possible.attacker.hp + dmg * move.drain[0] / move.drain[1]);
    }

    // handle status moves
    if (move.status) {
      possible.defender.statuses = possible.defender.statuses || [];
      possible.defender.statuses.push(move.status);
    }

    if (move.volatileStatus) {
      if (move.target === 'self') {
        possible.attacker.volatileStatus = move.volatileStatus;
      } else {
        possible.defender.volatileStatus = move.volatileStatus;
      }
    }

    if (move.self) {
      if (move.self.boosts) {
        // ex. 'superpower'
        possible.attacker.boosts = _pokeutil2.default.boostCombiner(possible.attacker.boosts, move.boosts);
      } else if (move.self.volatileStatus) {
        // ex. 'roost'
        possible.attacker.volatileStatus = move.volatileStatus;
      }
    }

    if (!move.secondary) {
      return [{
        attacker: possible.attacker,
        defender: possible.defender,
        chance: 1
      }];
    }

    // apply effects that may or may not happen
    const secondary = move.secondary;

    // need util.clones so that references to objects don't get tangled
    const noproc = _pokeutil2.default.clone(possible);
    const procs = _pokeutil2.default.clone(possible);

    noproc.chance = 1 - secondary.chance / 100;
    procs.chance = secondary.chance / 100;

    if (secondary.self) {
      if (secondary.self.boosts) {
        procs.attacker.boosts = _pokeutil2.default.boostCombiner(possible.attacker.boosts, secondary.self.boosts);
      }
    }
    if (secondary.boosts) {
      procs.defender.boosts = _pokeutil2.default.boostCombiner(possible.defender.boosts, secondary.boosts);
    }
    if (secondary.volatileStatus) {
      if (move.target === 'self') {
        procs.attacker.volatileStatus = secondary.volatileStatus;
      } else {
        procs.defender.volatileStatus = secondary.volatileStatus;
      }
    }

    // Log.debug('inside secondaries:', noproc.defender.volatileStatus, procs.defender.volatileStatus);

    return [noproc, procs];
  }

  /**
   * Apply damage to our pokemon.
   * @param  {[type]} mon [description]
   * @param  {[type]} dmg [description]
   * @return {[type]}     [description]
   */
  _takeDamage(mon, dmg) {
    const res = _pokeutil2.default.clone(mon);
    res.hp = Math.max(0, mon.hp - dmg);
    if (res.hp === 0) {
      return this._kill(res);
    }
    res.hppct = 100 * res.hp / res.maxhp;
    return res;
  }

  _kill(mon) {
    const res = _pokeutil2.default.clone(mon);
    res.dead = true;
    res.condition = '0 fnt';
    res.hp = 0;
    return res;
  }

  /**
   * Verify that our chance fields add up.
   *
   * @param  {[type]} arr      [description]
   * @param  {Number} expected [description]
   * @return {[type]}          [description]
   */
  _verifyTotalChance(arr, expected = 1) {
    const total = arr.reduce((prev, item) => {
      return prev + item.chance || 0;
    }, 0);

    if (total > expected * 0.99 && total < expected * 1.01) {
      return true;
    }
    _log2.default.error('Wrong total!' + total);
    return false;
  }
}
// import Fitness from './fitness';

exports.default = new TurnSimulator();