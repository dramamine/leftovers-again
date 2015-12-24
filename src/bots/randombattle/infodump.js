/**
 * Get some helpful info about pokemon & their moves
 *
 */
import AI from '../../ai';
import Damage from '../../lib/damage';
import Typechart from '../../lib/typechart';
// import Pokedex from '../../../data/pokedex';
import RandomMoves from '../../../data/randommoves';
import log from '../../log';

import {MOVE, SWITCH} from '../../decisions';

const meta = {
  battletype: 'randombattle',
  author: 'marten'
};

class Infodump extends AI {
  constructor() {
    // console.log('STABBY: built');
    super(meta);
  }

  onRequest(state) {
    console.log('infodumps state:: ', state);
    if (state.forceSwitch) {
      // our pokemon died :(
      // choose a random one
      //
      const possibleMons = state.self.reserve.filter( (mon) => {
        if (mon.condition === '0 fnt') return false;
        if (mon.active) return false;
        return true;
      });
      const myMon = this.pickOne(possibleMons);
      return new SWITCH(myMon);
    }


    // check each move
    let maxDamage = 0;
    let bestMove = 0;

    state.self.active.moves.forEach( (move, idx) => {
      if (move.disabled) return;
      let est = -1;
      try {
        est = Damage.getDamageResult(
          state.self.active,
          state.opponent.active,
          move
        );
      } catch (e) {
        console.log(e);
        console.log(state.self.active, state.opponent.active, move);
      }
      console.log('estimated ' + est + ' for move ' + move.name);
      if (est > maxDamage) {
        maxDamage = est;
        bestMove = idx;
      }
    });

    return new MOVE(bestMove);
  }

  getHelp(state) {
    // console.log('infodumps help state:: ', state);
    const extra = {
      moves: this._moves(state),
      opponent: this._opponent(state),
      switches: this._switches(state),
    };

    return extra;
  }

  _moves(state) {
    const extra = [];
    state.self.active.moves.forEach( (move) => {
      if (move.disabled) return;
      let est = -1;
      try {
        est = Damage.getDamageResult(
          state.self.active,
          state.opponent.active,
          move
        );
      } catch (e) {}

      extra.push({
        name: move.name,
        damage: est
      });
    });
    return extra;
  }

  _opponent(state) {
    // query for moves
    // run each through damage calculator
    return null;
  }

  _switches(state) {
    log.log('input:');
    log.log(JSON.stringify(state));
    // query for moves
    const oppMoves = RandomMoves[state.opponent.active.species.toLowerCase()];
    if (!oppMoves) {
      return {
        error: 'couldnt find species in random moves dictionary: ' +
          state.opponent.active.species
      };
    }
    const results = state.self.reserve.map( (mon) => {
      const oppCalcMoves = oppMoves.map( move => {
        // check damage from each of the opponent's moves against this mon.
        let est = -1;
        try {
          est = Damage.getDamageResult(
            state.opponent.active,
            mon,
            move
          );
        } catch (e) {}

        return {
          name: move,
          dmg: est
        };
      }).sort( (a, b) => a.dmg < b.dmg );

      // also check type advantage of mons in general
      let strength = false;
      let weakness = false;
      const attacks = [];
      const defenses = [];
      state.opponent.active.types.forEach( yourtype => {
        mon.types.forEach( mytype => {
          attacks.push( Typechart[mytype][yourtype] );
          defenses.push( Typechart[yourtype][mytype] );
        });
      });

      const maxatk = Math.max(...attacks);
      const maxdef = Math.max(...defenses);
      if (maxatk > 1) strength = true;
      if (maxdef > 1) weakness = true;


      return {
        species: mon.species,
        maxDamage: oppCalcMoves[0].dmg,
        results: oppCalcMoves,
        strength,
        weakness
      };
    });
    log.log('output:');
    log.log(results);
    return results;
  }

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

export default Infodump;
