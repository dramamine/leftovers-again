/**
 * Summon Talonflames to cast 'Tailwind' over and over.
 *
 * npm start -- research/tailwind
 */


const AI = require('@la/ai');
const { MOVE, SWITCH } = require('@la/decisions');

const moveId = 'tailwind';

module.exports = class Tailwind extends AI {
  constructor() {
    super();
    this.meta = {
      accepts: 'anythinggoes',
      format: 'anythinggoes',
      nickname: 'Tailwind ★marten★'
    };

    this.ctr = -1;
  }

  team() {
    return `
Talonflame
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Tailwind
- Agility
- Brave Bird
- Roost

Talonflame
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Tailwind
- Agility
- Brave Bird
- Roost

Talonflame
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Tailwind
- Agility
- Brave Bird
- Roost

Talonflame
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Tailwind
- Agility
- Brave Bird
- Roost

Talonflame
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Tailwind
- Agility
- Brave Bird
- Roost

Talonflame
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Tailwind
- Agility
- Brave Bird
- Roost
`;
  }

  decide(state) {
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
