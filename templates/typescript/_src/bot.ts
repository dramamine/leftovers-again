/**
 * {{Repo}}
 *
 */
import LeftoversAgain from 'leftovers-again';

/**
 * Your code is pre-built with a very simple bot that chooses a team, then
 * picks randomly from valid moves on its turn.
 */
export default class {{Repo}} extends LeftoversAgain.AI {

{{#if team }}
  team(opponent: string): string {
    return `
Magikarp @ Leftovers
Ability: Swift Swim
EVs: 252 HP / 4 Atk / 252 Spe
Careful Nature
- Celebrate
- Flail
- Happy Hour
- Splash`;
  }
{{/if}}

  /**
   * Here's the main loop of your bot. `state` contains everything about the
   * current state of the game. Please read the documentation for more
   * details.
   *
   * @param  {Object} state The current state of the game.
   *
   * @return {Decision}     A decision object.
   */
  decide(state: LeftoversAgain.State): LeftoversAgain.Decision { {{#if team}}
    // you're probably gonna turn this on. alternately, use the flag --loglevel=5
    // console.log(state);

    // `teamPreview` means the game hasn't started and you're choosing who to
    // send out first. {{/if}}
    // `forceSwitch` occurs if your Pokemon has just fainted, or other moves
    // that mean you need to switch out your Pokemon
    if ({{#if team}} state.teamPreview || {{/if}}state.forceSwitch) {
      const myMon = this.pickOne(
        // filter through your reserve of Pokemon for ones that aren't dead
        state.self.reserve.filter(mon => !mon.active && !mon.dead)
      );
      // return a Decision object. SWITCH takes Pokemon objects, Pokemon names,
      // and the reserve index [0-5] of the Pokemon you're switching into.
      return new LeftoversAgain.SWITCH(myMon);
    }

    const myMove = this.pickOne(
      // filter through your active Pokemon's moves for a move that isn't disabled
      (state.self.active as LeftoversAgain.PokemonData).moves.filter(
        move => !move.disabled
      )
    );
    // return a Decision object. MOVE takes Move objects, move names, and
    // move indexes [0-3].
    return new LeftoversAgain.MOVE(myMove);
  }

  // randomly chooses an element from an array
  pickOne(arr: Array<any>) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
