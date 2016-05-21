'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ai = require('../../ai');

var _ai2 = _interopRequireDefault(_ai);

var _decisions = require('../../decisions');

var _team = require('../../lib/team');

var _team2 = _interopRequireDefault(_team);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Randumb extends _ai2.default {
  constructor() {
    super();
    this.meta = {
      accepts: 'ALL', // trying this out, fingers crossed
      format: 'randombattle',
      team: null,
      version: 'alpha',
      nickname: 'Randumb ★marten★'
    };
  }

  team() {
    // if this gets called use a predetermined random team.
    // @TODO hardcoded to a Slowking team.
    return _team2.default.random(0);
  }

  decide(state) {
    if (state.forceSwitch || state.teamPreview) {
      // our pokemon died :(
      // choose a random one
      const possibleMons = state.self.reserve.filter(mon => {
        if (mon.condition === '0 fnt') return false;
        if (mon.active) return false;
        return true;
      });
      const myMon = this.pickOne(possibleMons);
      return new _decisions.SWITCH(myMon);
    }
    // pick a random move
    try {
      const possibleMoves = state.self.active.moves.filter(move => !move.disabled);
      const myMove = this.pickOne(possibleMoves);
      return new _decisions.MOVE(myMove);
    } catch (e) {
      console.log('broke when checking possible moves:', e);
      console.dir(state);
      return null;
    }
  }

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
} /**
   * Randumb bot. This guy follows simple logic: pick a random available move
   * on our active pokemon. When a pokemon dies, pick a random one to replace
   * it.
   *
   */


exports.default = Randumb;