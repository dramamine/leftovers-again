/**
 * Cast spikes all the time.
 *
 * npm run develop -- --bot=research/spikes
 */

import AI from 'ai';
import {MOVE, SWITCH} from 'decisions';

const moveId = 'workup';

export default class SunnyDay extends AI {
  constructor() {
    super();
    this.meta = {
      accepts: 'anythinggoes',
      format: 'anythinggoes',
      team: this.getTeam()
    };

    this.ctr = -1;
  }

  getTeam() {
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

  onRequest(state) {
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
