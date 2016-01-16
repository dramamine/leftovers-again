/**
 * Get some helpful info about pokemon & their moves
 *
 */
import Damage from '../../../lib/damage';
// import KO from '../../lib/kochance';
// import Typechart from '../../lib/typechart';
// // import Pokedex from '../../../data/pokedex';
// import RandomMoves from '../../../data/randommoves';
// import log from '../../log';
// import util from '../../util';

// import {MOVE, SWITCH} from '../../decisions';


export default class Fitness {

  evaluateFitness(state) {
    const mine = state.self.active;
    const yours = state.opponent.active;

    // from state, hits I will endure to kill opponent
    const hitsEndured = this._getHitsEndured(mine, yours);

    // from state, hits opponent will endure to kill me
    const hitsCaused = this._getHitsEndured(yours, mine);
  }

  // @TODO the whole thing
  // @TODO apply speed buffs, ex. paralysis with and without 'Quick Feet'
  _chanceOfFirst(speedA, speedB) {
    return 0.5;
  }

  _getMaxDmg(attacker, defender) {
    attacker.moves.forEach( (move, idx) => {
      if (move.disabled) return;
      let est = -1;
      try {
        est = Damage.getDamageResult(
          attacker,
          defender,
          move
        );
      } catch (e) {
        console.log(e);
      }
      if (est > maxDamage) {
        maxDamage = est;
        bestMove = idx;
      }
    });
    return maxDmg;
  }

  _getHitsEndured(attacker, defender) {
    // just using max dmg to keep it simple. most moves have the same 'spread'
    // so I'm not too worried about this.
    const maxDmg = this._getMaxDmg(attacker, defender);

    let statusDmg = 0;
    // @TODO burn needs to wear off
    if (defender.statuses.indexOf('brn') >= 0) {
      statusDmg += defender.calculatedMaxHP / 8; // @TODO does this exist
    }
    if (defender.statuses.indexOf('psn') >= 0) {
      statusDmg += defender.calculatedMaxHP / 8; // @TODO does this exist
    }

    // @TODO do I have any priority moves that would OHKO?
    const chanceOfFirst = this._chanceOfFirst(attacker.stats.speed,
      defender.calculatedStats.speed || [100, 200]);
    let hitsEndured = 0; // 10 is pretty bad.
    let remainingHP = defender.calculatedCurHP; // @TODO does this exist

    // subtracting out HPs here - we have the KO Chance library code available
    // but it seems like overkill and I"m worried about performance. also the
    // KO library doesn't give us as much flexibility with status effect
    // damage.
    const hitsAndWeights = [];
    while (hitsEndured < 10) {
      // if we get off a first hit...
      remainingHP -= maxDmg;
      if (remainingHP <= 0) {
        hitsAndWeights.push([hitsEndured, chanceOfFirst]);
        if (hitsAndWeights.length === 2) break;
      }
      // if we went second...
      hitsEndured++;

      // 'badly poisoned', gets worse each turn.
      // @TODO see if we've already calculated turns of toxicity
      // @TODO maybe track it in 'toxicity' or 'toxCounter' or something
      if (defender.statuses.indexOf('tox') >= 0) {
        statusDmg += defender.calculatedMaxHP / 16; // @TODO does this exist
      }
      remainingHP -= statusDmg;
      if (remainingHP <= 0) {
        hitsAndWeights.push([hitsEndured, 1 - chanceOfFirst]);
        if (hitsAndWeights.length === 2) break;
      }
    }

    // convert hitsAndWeights to weighted avg
    let weighted = hitsAndWeights.reduce((total, [hits, weight]) => {
      return total + (hits * weight);
    }, 0);

    // do we have status effects that make this worse?

    // paralysis penalty: moves fail 25% of the time
    if (attacker.statuses.indexOf('par') >= 0) {
      weighted *= 1.25;
    }
    // frozen penalty: gonna cost you some turns.
    // 0 turns: .20
    // 1 turn: .16     (0-1 turns: .36)
    // 2 turns: .128   (0-2 turns: .488)
    // 3 turns: .1024  (0-3 turns: .5904)
    if (attacker.statuses.indexOf('frz') >= 0) {
      weighted += 2.1;
    }

    if (attacker.statuses.indexOf('slp') >= 0) {
      weighted += 2;
    }

    if (attacker.volatileStatuses.indexOf('confusion') >= 0) { // @TODO this doesn't exist
      weighted += 2;
    }

    return weighted;
  }
}
