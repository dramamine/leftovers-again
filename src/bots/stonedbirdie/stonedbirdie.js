/**
 * StonedBirdie
 *
 */
const AI = require('@la/ai');
const { MOVE, SWITCH } = require('@la/decisions');


class StonedBirdie extends AI {
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
      const myMon = this.pickOne(
        state.self.reserve.filter(mon => !mon.dead)
      );
      return new SWITCH(myMon);
    }

    // const myMove = this.pickOne(
    //   state.self.active.moves.filter( move => !move.disabled )
    // );
    return new MOVE('stoneedge');
  }

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

module.exports = StonedBirdie;
