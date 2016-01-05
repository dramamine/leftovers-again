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
import util from '../../util';

import {MOVE, SWITCH} from '../../decisions';

const meta = {
  battletype: 'randombattle',
  author: 'marten'
};

class Infodump extends AI {
  constructor() {
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
    // this'll be null during forceSwitch
    if (state.self.active && state.self.active.moves) {
      state.self.active.moves.forEach( (move) => {
        let est = [-1, -1];
        if (!move.disabled) {
          try {
            est = Damage.getDamageRange(
              state.self.active,
              state.opponent.active,
              move
            );
          } catch (e) {}
        }

        extra.push({
          name: move.name,
          damage: est
        });
      });
    }
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
    const oppMoves = RandomMoves[util.toId(state.opponent.active.species)];
    if (!oppMoves) {
      return {
        error: 'couldnt find species in random moves dictionary: ' +
          state.opponent.active.species
      };
    }
    // for each of my pokemons...
    const results = state.self.reserve.map( (mon) => {
      // see how the opponent would fare against this mon of mine.
      const yourMoves = oppMoves.map( move => {
        // check damage from each of the opponent's moves against this mon.
        let est = [-1, -1];
        try {
          est = Damage.getDamageRange(
            state.opponent.active,
            mon,
            move
          );
        } catch (e) {
          console.log(e);
        }
        console.log('damage result:', est, move);
        return {
          name: move, // this is just the ID of a move
          dmg: est
        };
      }).sort( (a, b) => a.dmg[1] < b.dmg[1] );

      // see how my moves would fare against the opponent's current mon.
      const myMoves = mon.moves.map( move => {
        let est = [-1, -1];
        try {
          est = Damage.getDamageRange(
            mon, // my mon
            state.opponent.active,
            move // my move
          );
          console.log('my ' + mon.species + ' uses ' + move.name + ' against '
            + state.opponent.active.species + ':', est);
        } catch (e) {}

        return {
          name: move.id, // this is a move object
          dmg: est
        };
      }).sort( (a, b) => a.dmg[1] < b.dmg[1] );

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

      console.log(mon);

      return {
        species: mon.species,
        active: mon.active,
        yourBest: yourMoves[0],
        myBest: myMoves[0],
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
