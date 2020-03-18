/**
 * Sumobot
 *
 */
const AI = require('@la/ai');
const { MOVE, SWITCH } = require('@la/decisions');
// const util = require('@la/pokeutil');

class Sumobot extends AI {
  team() {
    return `
Tapu Fini
Ability: Misty Surge
EVs: 248 HP / 252 SpA / 8 SpD
Modest Nature
IVs: 30 SpA / 30 SpD / 30 Spe
- Calm Mind
- Defog
- Grass Knot

Araquanid @ Waterium Z
Ability: Water Bubble
EVs: 248 HP / 8 Atk / 252 Def
Impish Nature
- X-Scissor
- Scald
- Protect
- Poison Jab

Tapu Koko @ King's Rock
Ability: Electric Surge
EVs: 248 HP / 172 Def / 88 SpD
Relaxed Nature
IVs: 0 Atk
- U-turn
- Brave Bird
- Wild Charge
- Roost

Celesteela @ Leftovers
Ability: Beast Boost
EVs: 252 HP / 4 Def / 252 SpD
Sassy Nature
- Leech Seed
- Protect
- Flamethrower
- Earthquake

Greninja-Ash @ Expert Belt
Ability: Battle Bond
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
IVs: 0 Atk / 30 SpA / 30 Spe
- Hydro Pump
- Ice Beam
- Dark Pulse

Pheromosa @ Focus Sash
Ability: Beast Boost
EVs: 252 Atk / 4 SpA / 252 Spe
Hasty Nature
- High Jump Kick
- U-turn
- Ice Beam
- Rapid Spin

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

module.exports = Sumobot;
