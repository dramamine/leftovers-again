'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ai = require('../../ai');

var _ai2 = _interopRequireDefault(_ai);

var _decisions = require('../../decisions');

var _pokeutil = require('../../pokeutil');

var _pokeutil2 = _interopRequireDefault(_pokeutil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Whynotbaut extends _ai2.default {
  constructor() {
    super();
  }

  team() {
    return `
Whynaut (Wynaut) @ Berry Juice
Level: 100
Ability: Shadow Tag
EVs: 236 HP / 132 Def / 132 SpD
Bold Nature
- Encore
- Counter
- Mirror Coat
- Destiny Bond

Whybaut (Wynaut) @ Berry Juice
Level: 100
Ability: Shadow Tag
EVs: 236 HP / 132 Def / 132 SpD
Bold Nature
- Encore
- Counter
- Mirror Coat
- Destiny Bond

Whybot (Wynaut) @ Berry Juice
Level: 100
Ability: Shadow Tag
EVs: 236 HP / 132 Def / 132 SpD
Bold Nature
- Encore
- Counter
- Mirror Coat
- Destiny Bond

Wheybot (Wynaut) @ Berry Juice
Level: 100
Ability: Shadow Tag
EVs: 236 HP / 132 Def / 132 SpD
Bold Nature
- Encore
- Counter
- Mirror Coat
- Destiny Bond

Wobot (Wynaut) @ Berry Juice
Level: 100
Ability: Shadow Tag
EVs: 236 HP / 132 Def / 132 SpD
Bold Nature
- Encore
- Counter
- Mirror Coat
- Destiny Bond

Wy (Wynaut) @ Berry Juice
Level: 100
Ability: Shadow Tag
EVs: 236 HP / 132 Def / 132 SpD
Bold Nature
- Encore
- Counter
- Mirror Coat
- Destiny Bond

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
    if (state.forceSwitch || state.teamPreview) {
      const myMon = this._pickOne(state.self.reserve.filter(mon => !mon.dead));
      return new _decisions.SWITCH(myMon);
    }

    let move = '';
    const myHp = state.self.active.hppct;

    if (myHp > 80 && myHp < 100 && state.self.active.lastMove !== 'encore') {
      move = 'encore';
    } else if (myHp < 25) {
      move = 'destinybond';
    } else {
      move = this._pickMirrorCoatOrCounter(state);
    }

    return new _decisions.MOVE(move);
  }

  _pickMirrorCoatOrCounter(state) {
    const theirMove = state.opponent.active.lastMove;
    if (theirMove) {
      const theirMoveObject = _pokeutil2.default.researchMoveById(theirMove);
      switch (theirMoveObject.category) {
        case 'Physical':
          return 'counter';
        case 'Special':
          return 'mirrorcoat';
        default:
          break;
      }
    }

    if (state.opponent.active.baseStats.atk > state.opponent.active.baseStats.spa) {
      return 'counter';
    }
    return 'mirrorcoat';
  }

  _pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
} /**
   * Whynotbaut
   *
   */


exports.default = Whynotbaut;