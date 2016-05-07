/**
 * Randumb bot. This guy follows simple logic: pick a random available move
 * on our active pokemon. When a pokemon dies, pick a random one to replace
 * it.
 *
 */
import AI from 'ai';
import {MOVE, SWITCH} from 'decisions';
import team from 'lib/team';

class Randumb extends AI {
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
    return team.random(0);
  }

  decide(state) {
    if (state.forceSwitch || state.teamPreview) {
      // our pokemon died :(
      // choose a random one
      const possibleMons = state.self.reserve.filter( (mon) => {
        if (mon.condition === '0 fnt') return false;
        if (mon.active) return false;
        return true;
      });
      const myMon = this.pickOne(possibleMons);
      return new SWITCH(myMon);
    }
    // pick a random move
    try {
      const possibleMoves = state.self.active.moves.filter( move => !move.disabled );
      const myMove = this.pickOne(possibleMoves);
      return new MOVE(myMove);
    } catch(e) {
      console.log('broke when checking possible moves:', e);
      console.dir(state);
      return null;
    }
  }

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

export default Randumb;
