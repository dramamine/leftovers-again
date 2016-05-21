'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ai = require('../../ai');

var _ai2 = _interopRequireDefault(_ai);

var _damage = require('../../game/damage');

var _damage2 = _interopRequireDefault(_damage);

var _kochance = require('../../game/kochance');

var _kochance2 = _interopRequireDefault(_kochance);

var _typechart = require('../../game/typechart');

var _typechart2 = _interopRequireDefault(_typechart);

var _formats = require('../../data/formats');

var _formats2 = _interopRequireDefault(_formats);

var _log = require('../../log');

var _log2 = _interopRequireDefault(_log);

var _pokeutil = require('../../pokeutil');

var _pokeutil2 = _interopRequireDefault(_pokeutil);

var _decisions = require('../../decisions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get some helpful info about pokemon & their moves
 *
 */

class Infodump extends _ai2.default {
  constructor() {
    super();
  }

  decide(state) {
    _log2.default.info('infodumps state:: ', state);
    _damage2.default.assumeStats(state.opponent.active);
    if (state.forceSwitch) {
      // our pokemon died :(
      // choose a random one
      //
      const possibleMons = state.self.reserve.filter(mon => {
        if (mon.condition === '0 fnt') return false;
        if (mon.active) return false;
        return true;
      });
      const myMon = this.pickOne(possibleMons);
      return new _decisions.SWITCH(myMon);
    }

    // check each move
    let maxDamage = 0;
    let bestMove = 0;

    state.self.active.moves.forEach((move, idx) => {
      if (move.disabled) return;
      if (move.pp === 0) return;
      let est = -1;
      try {
        est = _damage2.default.getDamageResult(state.self.active, state.opponent.active, move, { weather: state.weather });
      } catch (e) {
        _log2.default.error(e);
        _log2.default.error(state.self.active, state.opponent.active, move);
      }
      _log2.default.info('estimated ' + est + ' for move ' + move.name);
      if (est > maxDamage) {
        maxDamage = est;
        bestMove = idx;
      }
    });

    return new _decisions.MOVE(bestMove);
  }

  getHelp(state) {
    // console.log('infodumps help state:: ', state);
    _damage2.default.assumeStats(state.opponent.active);

    const extra = {};

    try {
      extra.moves = this._moves(state);
    } catch (e) {
      _log2.default.error(e);
      _log2.default.error(JSON.stringify(state));
    }
    try {
      extra.switches = this._switches(state);
    } catch (e) {
      _log2.default.error(e);
      _log2.default.error(JSON.stringify(state));
    }

    return extra;
  }

  _moves(state) {
    const extra = [];
    // this'll be null during forceSwitch
    if (state.self.active && state.self.active.moves) {
      state.self.active.moves.forEach(move => {
        let est = [-1];
        if (!move.disabled) {
          try {
            est = _damage2.default.getDamageResult(state.self.active, state.opponent.active, move, { weather: state.weather });
          } catch (e) {
            _log2.default.error(e);
          }
        }
        const ko = _kochance2.default.predictKO(est, state.opponent.active);
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

  _switches(state) {
    _log2.default.log('input:');
    _log2.default.log(JSON.stringify(state));
    // query for moves
    const formatData = _formats2.default[_pokeutil2.default.toId(state.opponent.active.species)];
    const possibleMoves = formatData.randomBattleMoves;
    if (!possibleMoves) {
      return {
        error: 'couldnt find species in random moves dictionary: ' + state.opponent.active.species
      };
    }
    // for each of my pokemons...
    const results = state.self.reserve.map(mon => {
      // see how the opponent would fare against this mon of mine.
      const yourMoves = possibleMoves.map(move => {
        // check damage from each of the opponent's moves against this mon.
        let est = [-1];
        try {
          est = _damage2.default.getDamageResult(state.opponent.active, mon, move, { weather: state.weather });
        } catch (e) {
          _log2.default.error(e, state.opponent.active, mon, move);
        }
        return {
          name: move, // this is just the ID of a move
          dmg: est,
          against: mon
        };
      }).sort((a, b) => a.dmg[0] < b.dmg[0]);

      // see how my moves would fare against the opponent's current mon.
      const myMoves = mon.moves.map(move => {
        let est = [-1];
        try {
          est = _damage2.default.getDamageResult(mon, // my mon
          state.opponent.active, move, // my move
          { weather: state.weather });
          _log2.default.info('my ' + mon.species + ' uses ' + move.name + ' against ' + state.opponent.active.species + ':', est);
        } catch (e) {
          _log2.default.error(e);
        }

        return {
          name: move.id, // this is a move object
          dmg: est,
          against: state.opponent.active
        };
      }).sort((a, b) => a.dmg[0] < b.dmg[0]);

      // also check type advantage of mons in general
      let strength = false;
      let weakness = false;
      const attacks = [];
      const defenses = [];
      state.opponent.active.types.forEach(yourtype => {
        mon.types.forEach(mytype => {
          attacks.push(_typechart2.default.compare(mytype, yourtype));
          defenses.push(_typechart2.default.compare(yourtype, mytype));
        });
      });

      const maxatk = Math.max(...attacks);
      const maxdef = Math.max(...defenses);
      if (maxatk > 1) strength = true;
      if (maxdef > 1) weakness = true;

      // console.log(mon);

      const yourBest = yourMoves[0];
      _log2.default.info('predicting KO..', yourBest.dmg, yourBest.against);
      const yourKO = _kochance2.default.predictKO(yourBest.dmg, yourBest.against);

      const myBest = myMoves[0];
      _log2.default.info('predicting KO..', myBest.dmg, myBest.against);
      const myKO = _kochance2.default.predictKO(myBest.dmg, myBest.against);

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
    _log2.default.log('output:');
    _log2.default.log(results);
    return results;
  }

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

exports.default = Infodump;