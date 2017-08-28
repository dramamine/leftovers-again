const Log = require('../log');
const data = require('../data/typechart.json');
/**
 * Type chart, in the format [Attacker][Defender] = attack multiplier.
 * Derived from the official Gen 6 charts.
 */
class Typechart {
  /**
   * See how effective this move will be against this Pokemon's type/types.
   *
   * @param  {String} move   The move type, ex. 'Normal'
   * @param  {Array|String} target  The target's type, ex. 'Ghost', or ['Ghost', 'Steel']
   * @return {Number}        The type effectiveness coefficient.
   */
  compare(move, target) {
    // target is an array
    if (Array.isArray(target)) {
      return target.reduce((prev, item) => {
        if (data[move] === undefined || data[move][item] === undefined) {
          Log.error(`Typechart array error, are these Capitalized? ${move} ${item}`);
          return prev;
        }
        return prev * data[move][item];
      }, 1);
    }
    // target is a string
    if (data[move] === undefined || data[move][target] === undefined) {
      Log.error(`Typechart string error, are these Capitalized? ${move} ${target}`);
      return 1;
    }
    return data[move][target];
  }
}

module.exports = new Typechart();
