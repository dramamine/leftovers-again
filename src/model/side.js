import SideEffects from 'constants/sideeffects';
import Log from 'log';

const clean = (x) => {
  return x.replace('Move: ', '').trim();
};

// does
const STACKS = {
  [SideEffects.SPIKES]: 3
};

/**
 * Pokemon class, for tracking information and status of each Pokemon.
 */
export default class Side {
  constructor() {
    this.stuff = {};
  }

  digest(action) {
    const move = clean(action);
    if (Object.keys(SideEffects).find( x => SideEffects[x] === move) ) {
      // if it's already set, AND it's a stacking move
      if (this.stuff[move] && STACKS[move]) {
        this.stuff[move] = Math.min(this.stuff[move] + 1, STACKS[move]);
      } else {
        this.stuff[move] = 1;
      }
    } else {
      Log.warn('Never heard of starting this side effect:', action);
    }
  }

  remove(action) {
    const move = clean(action);
    if (this.stuff[move]) {
      delete this.stuff[move];
    } else {
      Log.warn('Never heard of ending this side effect:', action);
    }
  }

  data() {
    return this.stuff;
  }
}
