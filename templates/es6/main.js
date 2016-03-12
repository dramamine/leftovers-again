/**
 * {{Repo}}
 *
 */
import AI from 'ai';
import {MOVE, SWITCH} from 'decisions';


class {{Repo}} extends AI {
  constructor() {
    super();
  }

{{#if team }}
  getTeam() {
    return `
Magikarp @ Leftovers
Ability: Rattled
EVs: 252 HP / 4 Atk / 252 Spe
Careful Nature
- Celebrate
- Flail
- Happy Hour
- Splash`;
  }
{{/if}}

  onRequest(state) {
    if (state.forceSwitch) {
      const myMon = this._pickOne(
        state.self.reserve.filter( mon => !mon.dead );
      );
      return new SWITCH(myMon);
    }
    const myMove = this._pickOne(
      state.self.active.moves.filter( move => !move.disabled );
    );
    return new MOVE(myMove);
  }

  _pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

export default {{Repo}};
