/**
 * Sumobot
 *
 */
const AI = require('@la/ai');
const { MOVE, SWITCH } = require('@la/decisions');
// const util = require('@la/pokeutil');

class Sumozbot extends AI {
  team() {
    return `
Araquanid @ Waterium Z
Ability: Water Bubble
EVs: 248 HP / 8 Atk / 252 Def
Impish Nature
- X-Scissor
- Scald
- Protect
- Poison Jab
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
    // check for z-moves
    const zMove = state.self.active.moves.find(move => move.canZMove);
    if (zMove) {
      console.log('fck yeah found my z-move');
      const move = new MOVE(zMove);
      if (zMove.canZMove) {
        console.log('it even sez that it can z-move');
        console.log(zMove.zMove);
      }
      return move;
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

module.exports = Sumozbot;
