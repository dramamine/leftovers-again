'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ai = require('../../ai');

var _ai2 = _interopRequireDefault(_ai);

var _decisions = require('../../decisions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * See if this guy mega-evolves. Or not! Check shouldMegaEvo to see what
 * you're doing
 *
 * npm run develop -- --bot=research/megaevo
 */

const moveId = 'scald';

class MegaEvo extends _ai2.default {
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
      return new _decisions.SWITCH(this.ctr);
    }
    const move = new _decisions.MOVE(moveId);
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
exports.default = MegaEvo;