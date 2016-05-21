'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ai = require('ai');

var _ai2 = _interopRequireDefault(_ai);

var _decisions = require('decisions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Cast spikes all the time.
 *
 * npm run develop -- --bot=research/spikes
 */

const moveId = 'workup';

class SunnyDay extends _ai2.default {
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
Pancham
Ability: Mold Breaker
Level: 100
EVs: 180 Atk / 100 Def / 212 SpD / 12 Spe
Adamant Nature
- Swords Dance
- Work Up
- Knock Off
- Gunk Shot

Pancham
Ability: Mold Breaker
Level: 100
EVs: 180 Atk / 100 Def / 212 SpD / 12 Spe
Adamant Nature
- Swords Dance
- Work Up
- Knock Off
- Gunk Shot

Pancham
Ability: Mold Breaker
Level: 100
EVs: 180 Atk / 100 Def / 212 SpD / 12 Spe
Adamant Nature
- Swords Dance
- Work Up
- Knock Off
- Gunk Shot

Pancham
Ability: Mold Breaker
Level: 100
EVs: 180 Atk / 100 Def / 212 SpD / 12 Spe
Adamant Nature
- Swords Dance
- Work Up
- Knock Off
- Gunk Shot

Pancham
Ability: Mold Breaker
Level: 100
EVs: 180 Atk / 100 Def / 212 SpD / 12 Spe
Adamant Nature
- Swords Dance
- Work Up
- Knock Off
- Gunk Shot

Pancham
Ability: Mold Breaker
Level: 100
EVs: 180 Atk / 100 Def / 212 SpD / 12 Spe
Adamant Nature
- Swords Dance
- Work Up
- Knock Off
- Gunk Shot
`;
  }

  decide(state) {
    console.log(state.self.reserve);
    if (state.forceSwitch || state.teamPreview || !this._can(state)) {
      this.ctr = this.ctr + 1;
      // will crash out when ctr >= 7;

      return new _decisions.SWITCH(this.ctr);
    }
    return new _decisions.MOVE(moveId);
  }

  _can(state) {
    if (!state.self.active) return false;
    if (!state.self.active.moves) return false;
    const move = state.self.active.moves.find(m => m.id === moveId);
    if (move.disabled) return false;
    return true;
  }
}

exports.default = SunnyDay;
exports.default = SunnyDay;