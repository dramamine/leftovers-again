const SideConditions = require('../constants/sideConditions');
const Log = require('../log');

/**
 * Clean an action string.
 */
const clean = x => x.replace(/move:/gi, '').replace(/ /g, '').toLowerCase();

// some effects can stack multiple times.
const STACKS = {
  [SideConditions.SPIKES]: 3,
  [SideConditions.STEALTHROCK]: 3,
  [SideConditions.TOXICSPIKES]: 2
};

/**
 * @TODO documentation
 */
class Side {
  /**
   * Side constructor.
   */
  constructor() {
    this.stuff = {};
  }

  /**
   * Digests an action. The server tells us about a new side effect, and we
   * record it here. ex. 'move: spikes' or 'Move: reflect'.
   * @param {String} action  The action reported by the server.
   */
  digest(action) {
    const move = clean(action);
    if (Object.keys(SideConditions).find(x => SideConditions[x] === move)) {
      // if it's already set, AND it's a stacking move
      if (this.stuff[move] && STACKS[move]) {
        this.stuff[move] = Math.min(this.stuff[move] + 1, STACKS[move]);
      } else {
        this.stuff[move] = 1;
      }
    } else {
      Log.warn('Never heard of starting this side effect: ' + move);
    }
  }

  /**
   * Removes a side effect. Side effects come to an end for various reasons;
   * here we mark the side effect as gone.
   * AFAIK 'stacked' side effects cannot have their stack reduced; they can
   * only be completely removed, ex. 'rapidspin' removes all spikes.

   * @param {String} action  The action reported by the server.
   */
  remove(action) {
    const move = clean(action);
    if (this.stuff[move]) {
      delete this.stuff[move];
    } else {
      Log.warn('Never heard of ending this side effect: ' + move);
    }
  }

  /**
   * Get the data about this side that we want to report back to the user.
   */
  data() {
    return this.stuff;
  }
}

module.exports = Side;
