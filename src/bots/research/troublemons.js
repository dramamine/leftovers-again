/**
 * See if this guy mega-evolves. Or not! Check shouldMegaEvo to see what
 * you're doing
 *
 * npm run develop -- --bot=research/troublemons
 */

const AI = require('@la/ai');
const { MOVE, SWITCH } = require('@la/decisions');

module.exports = class Trouble extends AI {
  constructor() {
    super();
    this.meta = {
      accepts: 'anythinggoes',
      format: 'anythinggoes'
    };

    this.ctr = -1;
  }

  team() {
    return `
Basculin-Blue-Striped @ Assault Vest
Ability: Adaptability
EVs: 252 Atk / 4 SpA / 252 Spe
Naive Nature
- Crunch
- Facade
- Hidden Power [Grass]
- Waterfall

Zoroark @ Choice Specs
Ability: Illusion
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Dark Pulse
- Focus Blast
- Trick
- Sludge Bomb

Kyurem-White @ Choice Specs
Ability: Turboblaze
EVs: 252 SpA / 4 SpD / 252 Spe
Modest Nature
- Draco Meteor
- Ice Beam
- Focus Blast
- Fusion Flare
`;

// Kyurem-Black @ Leftovers
// Ability: Teravolt
// EVs: 56 HP / 216 Atk / 236 Spe
// Lonely Nature
// - Substitute
// - Fusion Bolt
// - Dragon Claw
// - Ice Beam
  }

  decide(state) {
    if (state.forceSwitch || state.teamPreview || Math.random() < 0.2) {
      // our pokemon died :(
      // choose a random one
      const possibleMons = state.self.reserve.filter((mon) => {
        if (mon.condition === '0 fnt') return false;
        if (mon.active) return false;
        return true;
      });
      const myMon = this.pickOne(possibleMons);
      console.log('switching into this guy: ', myMon);
      return new SWITCH(myMon);
    }
    // pick a random move
    try {
      const possibleMoves = state.self.active.moves.filter(move => !move.disabled);
      const myMove = this.pickOne(possibleMoves);
      console.log('makin a move:', myMove.id);
      return new MOVE(myMove);
    } catch (e) {
      console.log('broke when checking possible moves:', e);
      console.dir(state);
      return null;
    }
  }

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
