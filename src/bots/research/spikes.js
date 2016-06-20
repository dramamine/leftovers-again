/**
 * Cast spikes all the time.
 *
 * npm run develop -- --bot=research/spikes
 */

import AI from 'leftovers-again/ai';
import {MOVE, SWITCH} from 'leftovers-again/decisions';

const moveId = 'spikes';

export default class SunnyDay extends AI {
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

      return new SWITCH(this.ctr);
    }
    return new MOVE(moveId);
  }

  can(state) {
    if (!state.self.active) return false;
    if (!state.self.active.moves) return false;
    const move = state.self.active.moves.find(m => m.id === moveId);
    if (move.disabled) return false;
    return true;
  }
}

export default SunnyDay;
