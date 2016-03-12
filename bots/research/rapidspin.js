/**
 * Cast rapid spin every 4th move, recover otherwise
 *
 * npm run develop -- --bot=research/rapidspin
 */
import AI from 'ai';
import {MOVE, SWITCH} from 'decisions';

const moveId = 'recover';

export default class RapidSpin extends AI {
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
Avalugg @ Leftovers
Ability: Sturdy
EVs: 248 HP / 8 Def / 252 SpD
Careful Nature
- Rapid Spin
- Recover
- Avalanche
- Earthquake

Avalugg @ Leftovers
Ability: Sturdy
EVs: 248 HP / 8 Def / 252 SpD
Careful Nature
- Rapid Spin
- Recover
- Avalanche
- Earthquake

Avalugg @ Leftovers
Ability: Sturdy
EVs: 248 HP / 8 Def / 252 SpD
Careful Nature
- Rapid Spin
- Recover
- Avalanche
- Earthquake

Avalugg @ Leftovers
Ability: Sturdy
EVs: 248 HP / 8 Def / 252 SpD
Careful Nature
- Rapid Spin
- Recover
- Avalanche
- Earthquake

Avalugg @ Leftovers
Ability: Sturdy
EVs: 248 HP / 8 Def / 252 SpD
Careful Nature
- Rapid Spin
- Recover
- Avalanche
- Earthquake

Avalugg @ Leftovers
Ability: Sturdy
EVs: 248 HP / 8 Def / 252 SpD
Careful Nature
- Rapid Spin
- Recover
- Avalanche
- Earthquake
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

    // cast rapid spin every 4th move
    if (state.rqid % 4 === 0) {
      return new MOVE('rapidspin');
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

export default RapidSpin;
