'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ai = require('../../ai');

var _ai2 = _interopRequireDefault(_ai);

var _decisions = require('../../decisions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Cast Sunny Day a lot.
 *
 * npm run develop -- --bot=research/sunnyday
 */
class SunnyDay extends _ai2.default {
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

      return new _decisions.SWITCH(this.ctr);
    }
    return new _decisions.MOVE('sunnyday');
  }

  canSunny(state) {
    if (!state.self.active) return false;
    if (!state.self.active.moves) return false;
    const sunny = state.self.active.moves.find(move => move.id === 'sunnyday');
    if (sunny.disabled) return false;
    return true;
  }
}

exports.default = SunnyDay;
exports.default = SunnyDay;