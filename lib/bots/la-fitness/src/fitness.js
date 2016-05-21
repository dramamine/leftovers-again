'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _damage = require('lib/damage');

var _damage2 = _interopRequireDefault(_damage);

var _formats = require('data/formats');

var _formats2 = _interopRequireDefault(_formats);

var _pokeutil = require('pokeutil');

var _pokeutil2 = _interopRequireDefault(_pokeutil);

var _log = require('log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get some helpful info about pokemon & their moves
 *
 */


class Fitness {

  rate(state, depth = 1) {
    // from state, hits I will endure to kill opponent
    const endurance = this._getHitsEndured(state.self.active, state.opponent.active);

    // from state, hits opponent will endure to kill me
    const block = this._getHitsEndured(state.opponent.active, state.self.active);

    // sigh, for fixing tests. sry
    if (!state.self.reserve) state.self.reserve = [];
    if (!state.opponent.reserve) state.opponent.reserve = [];

    // @TODO ugh lazy, just adding reserve and current hps
    const myHealth = this.partyFitness(state.self.reserve.filter(mon => !mon.active), state.self.side) + this.selfFitness(state.self.active);
    const yourHealth = this.partyFitness(state.opponent.reserve.filter(mon => !mon.active), state.opponent.side) + this.selfFitness(state.opponent.active);

    // hmm. this is gonna range from like -9 to 9
    // @TODO run this through a spreadsheet or something! jc so random
    const short = state.opponent.active.dead ? 10 : (block - endurance) / (endurance + 1);

    const long = (myHealth - yourHealth) / 100;

    const summary = short + long + depth;
    // console.log('rating a thing:');
    // console.log(endurance, block, myHealth, yourHealth, summary);
    return { endurance, block, myHealth, yourHealth, depth, summary };
  }

  selfFitness(mon) {
    if (mon.dead) return 0;
    return mon.hppct;
  }

  partyFitness(party = [], side = {}) {
    let sumHp = party.reduce((sum, curr) => {
      return sum + (curr.hppct || 0);
    }, 0);

    if (side.spikes) {
      const spikesFactor = 1 / ((5 - side.spikes) * 2); // trust me.
      const alive = party.filter(mon => {
        return !mon.dead;
      }).length;
      const potentialDamage = 100 * (alive - 1) * spikesFactor;
      console.log('lookin at spikes.', potentialDamage);
      sumHp -= Math.floor(potentialDamage, 0);
    }
    return sumHp;
  }

  evaluateFitness(mine, yours) {
    // from state, hits I will endure to kill opponent
    const endurance = this._getHitsEndured(mine, yours);

    // from state, hits opponent will endure to kill me
    const block = this._getHitsEndured(yours, mine);

    return { endurance, block };
  }

  // @TODO the whole thing
  // @TODO apply speed buffs, ex. paralysis with and without 'Quick Feet'
  _probablyGoesFirst(attacker, defender, move) {
    if (!move) {
      throw new Error('_probablyGoesFirst has no move!');
    }
    if (move.priority) {
      if (move.priority > 0) return true;
      if (move.priority < 0) return false;
    }

    const speedA = attacker.boostedStats ? attacker.boostedStats.spe : attacker.stats ? attacker.stats.spe : attacker.baseStats.spe;

    const speedB = defender.boostedStats ? defender.boostedStats.spe : defender.stats ? defender.stats.spe : defender.baseStats.spe;
    return speedA > speedB;
  }

  _getMaxDmg(attacker, defender, move = null) {
    // short-circuit this function: in this case we already know what move
    // the attacker is using, so we don't need to look through all their
    // possible moves.
    if (move) {
      return {
        maxDmg: _damage2.default.getDamageResult(attacker, defender, move, {}, true),
        bestMove: move
      };
    }

    let maxDmg = 0;
    let bestMove;
    const moves = attacker.moves || _formats2.default[_pokeutil2.default.toId(attacker.species)].randomBattleMoves.map(id => _pokeutil2.default.researchMoveById(id));

    moves.forEach(move => {
      if (move.disabled) return;
      let est = -1;
      try {
        est = _damage2.default.getDamageResult(attacker, defender, move, {}, true);
      } catch (e) {
        console.log(e);
      }
      if (est > maxDmg) {
        maxDmg = est;
        bestMove = move;
      }
    });
    // sometimes no moves do any damage :(
    if (!bestMove) {
      bestMove = moves[0];
    }

    return { maxDmg, bestMove };
  }

  /**
   * How many hits can the defender endure?
   * i.e. how many of his turns can he get off before I kill him?
   *
   * @param  {[type]} attacker [description]
   * @param  {[type]} defender [description]
   * @return {[type]}          [description]
   */
  _getHitsEndured(attacker, defender) {
    // just using max dmg to keep it simple. most moves have the same 'spread'
    // so I'm not too worried about this.
    const { maxDmg, bestMove } = this._getMaxDmg(attacker, defender);
    // console.log('endurance: got best move ' + bestMove.id + ' for mon ' + attacker.id);
    // @TODO shouldn't have to do this.
    if (!attacker.conditions) attacker.conditions = '';
    if (!defender.conditions) defender.conditions = '';

    let statusDmg = 0;
    // @TODO burn needs to wear off
    if (defender.conditions.indexOf('brn') >= 0) {
      statusDmg += defender.maxhp / 8; // @TODO does this exist
    }
    if (defender.conditions.indexOf('psn') >= 0) {
      statusDmg += defender.maxhp / 8; // @TODO does this exist
    }

    // @TODO do I have any priority moves that would OHKO?
    let isFirst = false;
    try {
      isFirst = this._probablyGoesFirst(attacker, defender, bestMove);
    } catch (e) {
      _log2.default.error('Something broke. check fitness-errors.out for details.');
      console.log(bestMove, attacker);
      _log2.default.error(e);
      _log2.default.toFile('fitness-errors.out', JSON.stringify(attacker));
      _log2.default.toFile('fitness-errors.out', JSON.stringify(defender));
      _log2.default.toFile('fitness-errors.out', JSON.stringify(bestMove));
      _log2.default.toFile('fitness-errors.out', '\n');
    }
    let hitsEndured = 0; // 10 is pretty bad.
    let remainingHP = defender.hp; // @TODO does this exist

    // subtracting out HPs here - we have the KO Chance library code available
    // but it seems like overkill and I"m worried about performance. also the
    // KO library doesn't give us as much flexibility with status effect
    // damage.
    while (hitsEndured < 10) {
      if (remainingHP !== 0 && !remainingHP) {
        console.log('bailing out! missing hp', attacker, defender);
        throw new Error('defender.hp is null');
      }
      // console.log(`isfirst: ${isFirst}, remaining HP: ${remainingHP} dmg: ${maxDmg}`);
      if (isFirst) {
        remainingHP -= maxDmg;
      }

      if (remainingHP <= 0) {
        break;
      }

      // if we went second...
      hitsEndured++;
      remainingHP -= maxDmg;

      // 'badly poisoned', gets worse each turn.
      // @TODO see if we've already calculated turns of toxicity
      // @TODO maybe track it in 'toxicity' or 'toxCounter' or something
      if (defender.conditions.indexOf('tox') >= 0) {
        statusDmg += defender.maxhp / 16; // @TODO does this exist
      }
      remainingHP -= statusDmg;
      // could be dead at this point! let's run the loop again though. all it
      // will do is deal more dmg if isFirst is true.
    }

    // do we have status effects that make this worse?

    // paralysis penalty: moves fail 25% of the time
    if (attacker.conditions.indexOf('par') >= 0) {
      hitsEndured *= 1.25;
    }
    // frozen penalty: gonna cost you some turns.
    // this will be slightly wrong for mons who have been frozen for some
    // turns already.
    // 0 turns: .20
    // 1 turn: .16     (0-1 turns: .36)
    // 2 turns: .128   (0-2 turns: .488)
    // 3 turns: .1024  (0-3 turns: .5904)
    if (attacker.conditions.indexOf('frz') >= 0) {
      hitsEndured += 2.1;
    }

    if (attacker.conditions.indexOf('slp') >= 0) {
      hitsEndured += 2;
    }

    if (attacker.volatileStatuses && attacker.volatileStatuses.indexOf('confusion') >= 0) {
      // @TODO this doesn't exist
      hitsEndured += 2;
    }

    return hitsEndured;
  }
}

exports.default = new Fitness();