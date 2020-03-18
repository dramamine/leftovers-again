/**
 * Cast boost moves all the time.
 *
 * npm run develop -- --bot=research/booster
 */

const AI = require('@la/ai');
const { MOVE, SWITCH } = require('@la/decisions');

const moveId = 'workup';

class Booster extends AI {
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
    if (state.forceSwitch || state.teamPreview || !this.can(state)) {
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

module.exports = Booster;
