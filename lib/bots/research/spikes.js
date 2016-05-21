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

const moveId = 'spikes';

class SunnyDay extends _ai2.default {
  constructor() {
    super();
    this.meta = {
      accepts: 'anythinggoes',
      format: 'anythinggoes',
      nickname: 'Yikes Spikes ★marten★'
    };

    this.ctr = -1;
  }

  team() {
    return `
Ferrothorn
Ability: Iron Barbs
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Relaxed Nature
- Stealth Rock
- Leech Seed
- Gyro Ball
- Spikes

Ferrothorn
Ability: Iron Barbs
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Relaxed Nature
- Stealth Rock
- Leech Seed
- Gyro Ball
- Spikes

Ferrothorn
Ability: Iron Barbs
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Relaxed Nature
- Stealth Rock
- Leech Seed
- Gyro Ball
- Spikes

Ferrothorn
Ability: Iron Barbs
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Relaxed Nature
- Stealth Rock
- Leech Seed
- Gyro Ball
- Spikes

Ferrothorn
Ability: Iron Barbs
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Relaxed Nature
- Stealth Rock
- Leech Seed
- Gyro Ball
- Spikes

Ferrothorn
Ability: Iron Barbs
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Relaxed Nature
- Stealth Rock
- Leech Seed
- Gyro Ball
- Spikes
`;
  }

  decide(state) {
    console.log('active effects: ', state.self.effects);
    console.log('opponent effects: ', state.opponent.effects);

    if (state.forceSwitch || !this.can(state)) {
      this.ctr = this.ctr + 1;
      // will crash out when ctr >= 7;

      return new _decisions.SWITCH(this.ctr);
    }
    return new _decisions.MOVE(moveId);
  }

  can(state) {
    if (!state.self.active) return false;
    if (!state.self.active.moves) return false;
    const move = state.self.active.moves.find(m => m.id === moveId);
    if (move.disabled) return false;
    return true;
  }
}

exports.default = SunnyDay;
exports.default = SunnyDay;