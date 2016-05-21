'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sideConditions = require('../constants/sideConditions');

var _sideConditions2 = _interopRequireDefault(_sideConditions);

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Clean an action string.
 */
const clean = x => {
  return x.replace('Move:', '').replace('move:', '').replace(' ', '').toLowerCase();
};

// some effects can stack multiple times.
const STACKS = {
  [_sideConditions2.default.SPIKES]: 3,
  [_sideConditions2.default.STEALTHROCK]: 3
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
    if (Object.keys(_sideConditions2.default).find(x => _sideConditions2.default[x] === move)) {
      // if it's already set, AND it's a stacking move
      if (this.stuff[move] && STACKS[move]) {
        this.stuff[move] = Math.min(this.stuff[move] + 1, STACKS[move]);
      } else {
        this.stuff[move] = 1;
      }
    } else {
      _log2.default.warn('Never heard of starting this side effect: ' + move);
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
      _log2.default.warn('Never heard of ending this side effect: ' + move);
    }
  }

  /**
   * Get the data about this side that we want to report back to the user.
   */
  data() {
    return this.stuff;
  }
}
exports.default = Side;