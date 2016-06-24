'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Utility functions.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _moves = require('./data/moves');

var _moves2 = _interopRequireDefault(_moves);

var _movesExt = require('./data/moves-ext');

var _movesExt2 = _interopRequireDefault(_movesExt);

var _pokedex = require('./data/pokedex');

var _pokedex2 = _interopRequireDefault(_pokedex);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PokeUtil = function () {
  function PokeUtil() {
    _classCallCheck(this, PokeUtil);
  }

  _createClass(PokeUtil, [{
    key: 'toId',

    /**
     * Return the Smogon official ID for a given Pokemon. This works on both
     * Pokemon 'species' and move 'name' fields. Use this field when you need
     * the 'standardized' name. These are used when you're looking up stuff from
     * the data folder.
     *
     * @param  {String} text The field to transform.
     * @return {String}      The ID.
     */
    value: function toId(text) {
      var name = '';
      if (!text) return name;

      // most lines copied from server code..
      name = ('' + text).replace(/[\|\s\[\]\,\']+/g, '').toLowerCase().trim();

      // these lines are not! but I needed them.
      name = name.replace(/[\-\.\ ]+/g, '');

      name = name.replace(/[^a-z0-9]/gi, '');

      if (name.length > 18) name = name.substr(0, 18).trim();
      return name;
    }

    /**
     * Get an object fulla data about a move.
     *
     * Data is sourced both from the official Smogon server and from the Honko
     * damage calculator. Honko data helps with the damage calculator.
     * @param  {String} id The move ID.
     * @return {Move}  A Move object.
     */

  }, {
    key: 'researchMoveById',
    value: function researchMoveById(id) {
      // hidden power moves end with '60'. hidden power ground comes out as
      // hiddenpowerground6 due to the 18-character limit. it's kept as
      // hiddenpowerground in our data.
      id = this.toId(id).replace(/6[0]?$/, ''); // eslint-disable-line

      if (!_moves2.default[id]) {
        _log2.default.warn('couldn\'t find my move ' + id);
        return { name: id, id: this.toId(id) };
      }

      var battleData = _moves2.default[id] || {};
      var honkoData = _movesExt2.default[id] || {};

      return Object.assign(battleData, honkoData);
    }

    /**
     * Get an object fulla data about a Pokemon.
     *
     * Data is a limited number of fields from the official Smogon server
     * data files.
     *
     * @param  {String} id The Pokemon ID.
     * @return {Pokemon}   A Pokemon object.
     */

  }, {
    key: 'researchPokemonById',
    value: function researchPokemonById(id) {
      id = this.toId(id); // eslint-disable-line
      if (_pokedex2.default[id]) {
        var res = this.clone(_pokedex2.default[id]);
        res.id = id;
        return res;
      }

      _log2.default.warn('couldn\'t find my pokemon ' + id);
      return { name: id, id: id };
    }

    /**
     * Combine two boost objects. (For example, use this to apply boost effects
     * to a mon's existing boosts.) Boost objects have keys for their stats
     * (atk, def, spa, spd, spe) and values representing their boost level.
     *
     * @param  {Object} old     A boost object.
     * @param  {Object} updates A boost object.
     * @return {Object}         A boost object.
     */

  }, {
    key: 'boostCombiner',
    value: function boostCombiner() {
      var old = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var updates = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      Object.keys(updates).forEach(function (boost) {
        old[boost] = Math.min(6, Math.max(-6, (old[boost] || 0) + updates[boost]));
      });
      return old;
    }

    /**
     * Apply boost levels to a stat.
     *
     * @param  {Number} stat The calculated stat.
     * @param  {Number} mod  The boost level, from -6 to 6.
     * @return {Number} The stat including the boost multiplier.
     */

  }, {
    key: 'boostMultiplier',
    value: function boostMultiplier(stat) {
      var mod = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

      return mod > 0 ? Math.floor(stat * (2 + mod) / 2) : mod < 0 ? Math.floor(stat * 2 / (2 - mod)) : stat;
    }

    /**
     * Get the position from the 'ident'.
     * @param  {String} ident The Pokemon ident.
     * @return {String} The position.
     */

  }, {
    key: 'identToPos',
    value: function identToPos(ident) {
      var posStr = ident.substr(0, ident.indexOf(':'));
      var position = posStr.length === 3 ? posStr : null;
      return position;
    }

    /**
     * Get the owner from the 'ident'.
     * @param  {String} ident The Pokemon ident.
     * @return {String} The owner.
     */

  }, {
    key: 'identToOwner',
    value: function identToOwner(ident) {
      return ident.substr(0, 2);
    }
  }, {
    key: 'identWithoutPosition',
    value: function identWithoutPosition(ident) {
      var _ident$split = ident.split(':');

      var _ident$split2 = _slicedToArray(_ident$split, 2);

      var player = _ident$split2[0];
      var nickname = _ident$split2[1];

      return player.substr(0, 2) + ':' + nickname;
    }
  }, {
    key: 'clone',
    value: function clone(x) {
      return JSON.parse(JSON.stringify(x));
    }
  }]);

  return PokeUtil;
}();

var util = new PokeUtil();
exports.default = util;