/**
 * Get some helpful info about pokemon & their moves
 *
 */
import AI from '../../ai';
import Damage from '../../lib/damage';
import KO from '../../lib/kochance';
import Typechart from '../../lib/typechart';
// import Pokedex from '../../../data/pokedex';
import Formats from '../../../data/formats';
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
    Damage.assumeStats(state.opponent.active);
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
    Damage.assumeStats(state.opponent.active);

    const extra = {};

    try {
      extra.moves = this._moves(state);
    } catch (e) {
      console.log(e);
      console.log(JSON.stringify(state));
    }
    try {
      extra.opponent = this._opponent(state);
    } catch (e) {
      console.log(e);
      console.log(JSON.stringify(state));
    }
    try {
      extra.switches = this._switches(state);
    } catch (e) {
      console.log(e);
      console.log(JSON.stringify(state));
    }

    return extra;
  }

  _moves(state) {
    const extra = [];
    // this'll be null during forceSwitch
    if (state.self.active && state.self.active.moves) {
      state.self.active.moves.forEach( (move) => {
        let est = [-1];
        if (!move.disabled) {
          try {
            est = Damage.getDamageResult(
              state.self.active,
              state.opponent.active,
              move
            );
          } catch (e) {}
        }
        const ko = KO.predictKO(est, state.opponent.active);
        extra.push({
          name: move.name,
          dmgMin: est[0],
          dmgMax: est[est.length - 1],
          koTurn: ko.turns || null,
          koChance: ko.chance || null
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
    const formatData = Formats[util.toId(state.opponent.active.species)];
    const possibleMoves = formatData.randomBattleMoves;
    if (!possibleMoves) {
      return {
        error: 'couldnt find species in random moves dictionary: ' +
          state.opponent.active.species
      };
    }
    // for each of my pokemons...
    const results = state.self.reserve.map( (mon) => {
      // see how the opponent would fare against this mon of mine.
      const yourMoves = possibleMoves.map( move => {
        // check damage from each of the opponent's moves against this mon.
        let est = [-1];
        try {
          est = Damage.getDamageResult(
            state.opponent.active,
            mon,
            move
          );
        } catch (e) {
          console.log(e);
        }
        return {
          name: move, // this is just the ID of a move
          dmg: est,
          against: mon
        };
      }).sort( (a, b) => a.dmg[0] < b.dmg[0] );

      // see how my moves would fare against the opponent's current mon.
      const myMoves = mon.moves.map( move => {
        let est = [-1];
        try {
          est = Damage.getDamageResult(
            mon, // my mon
            state.opponent.active,
            move // my move
          );
          console.log('my ' + mon.species + ' uses ' + move.name + ' against '
            + state.opponent.active.species + ':', est);
        } catch (e) {}

        return {
          name: move.id, // this is a move object
          dmg: est,
          against: state.opponent.active
        };
      }).sort( (a, b) => a.dmg[0] < b.dmg[0] );

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

      // console.log(mon);

      const yourBest = yourMoves[0];
      console.log('predicting KO..', yourBest.dmg, yourBest.against);
      const yourKO = KO.predictKO(yourBest.dmg, yourBest.against);


      const myBest = myMoves[0];
      console.log('predicting KO..', myBest.dmg, myBest.against);
      const myKO = KO.predictKO(myBest.dmg, myBest.against);


      return {
        species: mon.species,
        active: mon.active,
        yourBest: {
          name: yourBest.name,
          dmgMin: yourBest.dmg[0],
          dmgMax: yourBest.dmg[yourBest.dmg.length - 1],
          koTurns: yourKO.turns,
          koChance: yourKO.chance
        },
        myBest: {
          name: myBest.name,
          dmgMin: myBest.dmg[0],
          dmgMax: myBest.dmg[myBest.dmg.length - 1],
          koTurns: myKO.turns,
          koChance: myKO.chance
        },
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
