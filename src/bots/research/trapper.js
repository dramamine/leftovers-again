/**
 * Use dudes that trap the opponent. Good for seeing if the bot can handle
 * this without crashing.
 *
 * npm start -- research/trapper --loglevel=5
 */


const AI = require('@la/ai');
const { MOVE, SWITCH } = require('@la/decisions');

module.exports = class Trapper extends AI {
  constructor() {
    super();
    this.meta = {
      accepts: ['gen7anythinggoes', 'anythinggoes'],
      format: 'gen7anythinggoes',
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
IVs: 1 HP / 1 Atk / 1 Def / 1 SpA / 1 SpD / 1 Spe
Adamant Nature
- Earthquake
- Feint
- Rock Slide
- Toxic

Whinenaut (Wynaut) @ Berry Juice
Level: 5
Ability: Shadow Tag
EVs: 236 HP / 132 Def / 132 SpD
IVs: 1 HP / 1 Atk / 1 Def / 1 SpA / 1 SpD / 1 Spe
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
      const possibleMons = state.self.reserve.filter((mon) => {
        if (mon.condition === '0 fnt') return false;
        if (mon.active) return false;
        return true;
      });
      const myMon = this.pickOne(possibleMons);
      return new SWITCH(myMon);
    }
    // pick a random move
    const possibleMoves = state.self.active.moves.filter(move => !move.disabled);
    const myMove = this.pickOne(possibleMoves);
    return new MOVE(myMove);
  }

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
