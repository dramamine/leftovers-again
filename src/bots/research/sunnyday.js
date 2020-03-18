/**
 * Cast Sunny Day a lot.
 *
 * npm run develop -- --bot=research/sunnyday
 */
const AI = require('@la/ai');
const { MOVE, SWITCH } = require('@la/decisions');

module.exports = class SunnyDay extends AI {
  constructor() {
    super();
    this.meta = {
      accepts: 'anythinggoes',
      format: 'anythinggoes',
      nickname: 'Sunniest Day ★marten★'
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
- Sunny Day
- Agility
- Brave Bird
- Roost

Talonflame
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Sunny Day
- Agility
- Brave Bird
- Roost

Talonflame
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Sunny Day
- Agility
- Brave Bird
- Roost

Talonflame
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Sunny Day
- Agility
- Brave Bird
- Roost

Talonflame
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Sunny Day
- Agility
- Brave Bird
- Roost

Talonflame
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Sunny Day
- Agility
- Brave Bird
- Roost
`;
  }

  decide(state) {
    console.log('WEATHER REPORT: ' + state.weather);
    if (state.forceSwitch || !this.canSunny(state)) {
      this.ctr = this.ctr + 1;
      // will crash out when ctr >= 7;

      return new SWITCH(this.ctr);
    }
    return new MOVE('sunnyday');
  }

  canSunny(state) {
    if (!state.self.active) return false;
    if (!state.self.active.moves) return false;
    const sunny = state.self.active.moves.find(move => move.id === 'sunnyday');
    if (sunny.disabled) return false;
    return true;
  }
}
