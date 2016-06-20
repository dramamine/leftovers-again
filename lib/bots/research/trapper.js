'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ai = require('../../ai');

var _ai2 = _interopRequireDefault(_ai);

var _decisions = require('../../decisions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Use dudes that trap the opponent. Good for seeing if the bot can handle
 * this without crashing.
 *
 * npm start -- research/bravest
 */

class Trapper extends _ai2.default {
  constructor() {
    super();
    this.meta = {
      accepts: 'anythinggoes',
      format: 'anythinggoes',
      nickname: 'Trapper ★marten★'
    };

    this.ctr = -1;
  }

  team() {
    return `
Trippy (Trapinch) @ Berry Juice
Level: 5
Ability: Arena Trap
EVs: 156 HP / 36 Atk / 236 Def / 76 SpD
Adamant Nature
- Earthquake
- Feint
- Rock Slide
- Toxic

Wynaut (Wynaut) @ Berry Juice
Level: 5
Ability: Shadow Tag
EVs: 236 HP / 132 Def / 132 SpD
Bold Nature
- Encore
- Counter
- Mirror Coat
- Safeguard

Trappy (Trapinch) @ Berry Juice
Level: 5
Ability: Arena Trap
EVs: 156 HP / 36 Atk / 236 Def / 76 SpD
Adamant Nature
- Earthquake
- Feint
- Rock Slide
- Toxic

Whynaut (Wynaut) @ Berry Juice
Level: 5
Ability: Shadow Tag
EVs: 236 HP / 132 Def / 132 SpD
Bold Nature
- Encore
- Counter
- Mirror Coat
- Safeguard

Troppy (Trapinch) @ Berry Juice
Level: 5
Ability: Arena Trap
EVs: 156 HP / 36 Atk / 236 Def / 76 SpD
Adamant Nature
- Earthquake
- Feint
- Rock Slide
- Toxic

Whinenaut (Wynaut) @ Berry Juice
Level: 5
Ability: Shadow Tag
EVs: 236 HP / 132 Def / 132 SpD
Bold Nature
- Encore
- Counter
- Mirror Coat
- Safeguard
`;
  }

  decide(state) {
    if (state.forceSwitch || state.teamPreview) {
      // our pokemon died :(
      // choose a random one
      const possibleMons = state.self.reserve.filter(mon => {
        if (mon.condition === '0 fnt') return false;
        if (mon.active) return false;
        return true;
      });
      const myMon = this._pickOne(possibleMons);
      return new _decisions.SWITCH(myMon);
    }
    // pick a random move
    const possibleMoves = state.self.active.moves.filter(move => !move.disabled);
    const myMove = this._pickOne(possibleMoves);
    return new _decisions.MOVE(myMove);
  }

  _pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

exports.default = Trapper;
exports.default = Trapper;