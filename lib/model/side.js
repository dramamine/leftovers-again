'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _STACKS;

var _sideConditions = require('../constants/sideConditions');

var _sideConditions2 = _interopRequireDefault(_sideConditions);

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Clean an action string.
 */
var clean = function clean(x) {
  return x.replace(/move:/gi, '').replace(/ /g, '').toLowerCase();
};

// some effects can stack multiple times.
var STACKS = (_STACKS = {}, _defineProperty(_STACKS, _sideConditions2.default.SPIKES, 3), _defineProperty(_STACKS, _sideConditions2.default.STEALTHROCK, 3), _STACKS);

/**
 * @TODO documentation
 */

var Side = function () {
  /**
   * Side constructor.
   */

  function Side() {
    _classCallCheck(this, Side);

    this.stuff = {};
  }

  /**
   * Digests an action. The server tells us about a new side effect, and we
   * record it here. ex. 'move: spikes' or 'Move: reflect'.
   * @param {String} action  The action reported by the server.
   */


  _createClass(Side, [{
    key: 'digest',
    value: function digest(action) {
      var move = clean(action);
      if (Object.keys(_sideConditions2.default).find(function (x) {
        return _sideConditions2.default[x] === move;
      })) {
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

  }, {
    key: 'remove',
    value: function remove(action) {
      var move = clean(action);
      if (this.stuff[move]) {
        delete this.stuff[move];
      } else {
        _log2.default.warn('Never heard of ending this side effect: ' + move);
      }
    }

    /**
     * Get the data about this side that we want to report back to the user.
     */

  }, {
    key: 'data',
    value: function data() {
      return this.stuff;
    }
  }]);

  return Side;
}();

exports.default = Side;