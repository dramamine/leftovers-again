'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ai = require('../../ai');

var _ai2 = _interopRequireDefault(_ai);

var _decisions = require('../../decisions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * StonedBirdie
 *
 */


class StonedBirdie extends _ai2.default {
  constructor() {
    super();
  }

  team() {
    return `
Tyranny (Tyranitar) @ Choice Band
Ability: Sand Stream
EVs: 100 HP / 252 Atk / 156 Spe
Adamant Nature
- Stone Edge
- Crunch
- Superpower
- Pursuit

Branny (Tyranitar) @ Choice Band
Ability: Sand Stream
EVs: 100 HP / 252 Atk / 156 Spe
Adamant Nature
- Stone Edge
- Crunch
- Superpower
- Pursuit

Cranny (Tyranitar) @ Choice Band
Ability: Sand Stream
EVs: 100 HP / 252 Atk / 156 Spe
Adamant Nature
- Stone Edge
- Crunch
- Superpower
- Pursuit

Danny (Tyranitar) @ Choice Band
Ability: Sand Stream
EVs: 100 HP / 252 Atk / 156 Spe
Adamant Nature
- Stone Edge
- Crunch
- Superpower
- Pursuit

Fannie (Tyranitar) @ Choice Band
Ability: Sand Stream
EVs: 100 HP / 252 Atk / 156 Spe
Adamant Nature
- Stone Edge
- Crunch
- Superpower
- Pursuit

Granny (Tyranitar) @ Choice Band
Ability: Sand Stream
EVs: 100 HP / 252 Atk / 156 Spe
Adamant Nature
- Stone Edge
- Crunch
- Superpower
- Pursuit
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
    console.log(state);
    if (state.forceSwitch || state.teamPreview) {
      const myMon = this._pickOne(state.self.reserve.filter(mon => !mon.dead));
      return new _decisions.SWITCH(myMon);
    }

    // const myMove = this._pickOne(
    //   state.self.active.moves.filter( move => !move.disabled )
    // );
    return new _decisions.MOVE('stoneedge');
  }

  _pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

exports.default = StonedBirdie;