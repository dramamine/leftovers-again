/**
 * See if this guy mega-evolves. Or not! Check shouldMegaEvo to see what
 * you're doing
 *
 * npm run develop -- --bot=research/megaevo
 */

import AI from 'leftovers-again/ai';
import {MOVE, SWITCH} from 'leftovers-again/decisions';

const moveId = 'scald';

export default class MegaEvo extends AI {
  constructor() {
    super();
    this.meta = {
      accepts: 'anythinggoes',
      format: 'anythinggoes'
    };

    this.ctr = -1;
  }

  team() {
    return `
Blastoise @ Blastoisinite
Ability: Rain Dish
EVs: 184 HP / 252 SpA / 72 Spe
Modest Nature
- Rapid Spin
- Scald
- Dark Pulse
- Ice Beam

`;
  }

  decide(state) {
    if (state.teamPreview || state.forceSwitch || !this.can(state)) {
      this.ctr = this.ctr + 1;
      // will crash out when ctr >= 7;
      return new SWITCH(this.ctr);
    }
    const move = new MOVE(moveId);
    // set to false to see if we DON'T mega-evolve
    move.shouldMegaEvo = false;
    return move;
  }

  can(state) {
    if (!state.self.active) return false;
    if (!state.self.active.moves) return false;
    const move = state.self.active.moves.find(m => m.id === moveId);
    if (move.disabled) return false;
    return true;
  }
}
