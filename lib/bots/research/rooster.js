'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ai = require('../../ai');

var _ai2 = _interopRequireDefault(_ai);

var _decisions = require('../../decisions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Summon Talonflames to cast 'Roost' over and over.
 *
 * npm run develop -- --bot=anythinggoes/tester/rooster.js
 */

const moveId = 'roost';

class Rooster extends _ai2.default {
  constructor() {
    super();
    this.meta = {
      accepts: 'anythinggoes',
      format: 'anythinggoes',
      nickname: 'Rooster ★marten★'
    };

    this.ctr = -1;
  }

  team() {
    return `
TalonflameA (Talonflame)
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Acrobatics
- Agility
- Brave Bird
- Roost

TalonflameB (Talonflame)
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Acrobatics
- Agility
- Brave Bird
- Roost

TalonflameC (Talonflame)
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Acrobatics
- Agility
- Brave Bird
- Roost

TalonflameD (Talonflame)
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Acrobatics
- Agility
- Brave Bird
- Roost

TalonflameE (Talonflame)
Ability: Gale Wings
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Acrobatics
- Agility
- Brave Bird
- Roost

TalonflameF (Talonflame)
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

  decide(state) {
    if (state.forceSwitch || state.teamPreview || !this.can(state)) {

      const possibleMons = state.self.reserve.filter(mon => {
        if (mon.condition === '0 fnt') return false;
        if (mon.active) return false;
        return true;
      });
      return new _decisions.SWITCH(this.pickOne(possibleMons));
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

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

exports.default = Rooster;
exports.default = Rooster;