/**
 * Summon Talonflames to cast 'Roost' over and over.
 *
 * npm run develop -- --bot=anythinggoes/tester/rooster.js
 */


import AI from 'ai';
import {MOVE, SWITCH} from 'decisions';
const meta = {
  battletype: 'anythinggoes'
};

export default class Rooster extends AI {
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
Talonflame
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Acrobatics
- Agility
- Brave Bird
- Roost

Talonflame
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Acrobatics
- Agility
- Brave Bird
- Roost

Talonflame
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Acrobatics
- Agility
- Brave Bird
- Roost

Talonflame
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Acrobatics
- Agility
- Brave Bird
- Roost

Talonflame
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Acrobatics
- Agility
- Brave Bird
- Roost

Talonflame
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Acrobatics
- Agility
- Brave Bird
- Roost
`;
  }

  onRequest(state) {
    if (state.forceSwitch || !this.canRoost(state)) {
      console.log('need 2 switch: ', state.forceSwitch, state.self.active.moves);

      this.ctr = this.ctr + 1;
      // will crash out when ctr >= 7;

      return new SWITCH(this.ctr);
    }
    return new MOVE('roost');
  }

  canRoost(state) {
    if (!state.self.active) return false;
    if (!state.self.active.moves) return false;
    const roost = state.self.active.moves.find(move => move.id === 'roost');
    if (roost.pp === 0) return false;
    if (roost.disabled) return false;
    return true;
  }
}

export default Rooster;
