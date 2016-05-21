'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typechart = require('../data/typechart');

var _typechart2 = _interopRequireDefault(_typechart);

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
        if (_typechart2.default[move] === undefined || _typechart2.default[move][item] === undefined) {
          _log2.default.error(`Typechart array error, are these Capitalized? ${ move } ${ item }`);
          return prev;
        }
        return prev * _typechart2.default[move][item];
      }, 1);
    }
    // target is a string
    if (_typechart2.default[move] === undefined || _typechart2.default[move][target] === undefined) {
      _log2.default.error(`Typechart string error, are these Capitalized? ${ move } ${ target }`);
      return 1;
    }
    return _typechart2.default[move][target];
  }
}

exports.default = new Typechart();