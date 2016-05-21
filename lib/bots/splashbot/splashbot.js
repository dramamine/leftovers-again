'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ai = require('ai');

var _ai2 = _interopRequireDefault(_ai);

var _decisions = require('decisions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * SplashBot
 *
 */


class SplashBot extends _ai2.default {
  constructor() {
    super();
    this.ctr = -1;
  }

  team() {
    return `
MagikarpA (Magikarp) @ Leftovers
Ability: Swift Swim
Level: 100
EVs: 252 HP / 4 SpD / 252 Spe
Timid Nature
- Splash

MagikarpB (Magikarp) @ Leftovers
Ability: Swift Swim
Level: 100
EVs: 252 HP / 4 SpD / 252 Spe
Timid Nature
- Splash

MagikarpC (Magikarp) @ Leftovers
Ability: Swift Swim
Level: 100
EVs: 252 HP / 4 SpD / 252 Spe
Timid Nature
- Splash

MagikarpD (Magikarp) @ Leftovers
Ability: Swift Swim
Level: 100
EVs: 252 HP / 4 SpD / 252 Spe
Timid Nature
- Splash

MagikarpE (Magikarp) @ Leftovers
Ability: Swift Swim
Level: 100
EVs: 252 HP / 4 SpD / 252 Spe
Timid Nature
- Splash

MagikarpF (Magikarp) @ Leftovers
Ability: Swift Swim
Level: 100
EVs: 252 HP / 4 SpD / 252 Spe
Timid Nature
- Splash
`;
  }

  /**
   * Here's the main loop of your bot. Please read the documentation for more
   * details.
   *
   * @param  {Object} state The current state of the game.
   *
   * @return {Decision}     A decision object.
   */
  decide(state) {
    // console.log(state);
    console.log('how many alive?' + state.self.reserve.filter(mon => !mon.dead).length);
    console.log('how many dead?' + state.self.reserve.filter(mon => mon.dead).length);
    if (state.forceSwitch || state.teamPreview || state.self.active.length === 0) {
      this.ctr++;
      const possibleMons = state.self.reserve.filter(mon => {
        if (mon.condition === '0 fnt') return false;
        if (mon.active) return false;
        if (mon.dead) return false;
        return true;
      });
      const myMon = this._pickOne(possibleMons);
      console.log('switching to: ', myMon);
      console.log(JSON.stringify(state));
      return new _decisions.SWITCH(this.ctr);
    }
    console.log('doing this move: (splash)');
    // console.log(JSON.stringify(state));
    return new _decisions.MOVE(0); // splash
  }

  _pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

exports.default = SplashBot;