/**
 * Emptiest bot.
 *
 */
import AI from 'leftovers-again/ai';

class Blank extends AI {
  constructor() {
    super();
    this.meta = {
      accepts: 'gen7randombattle',
      format: 'gen7randombattle',
      team: null,
      version: 'alpha',
      nickname: 'Blank ★marten★'
    };
  }

  decide(state) {
    if (state.forceSwitch || state.teamPreview) {
      return '/switch 1';
    }
    return '/move 1';
  }
}

export default Blank;
