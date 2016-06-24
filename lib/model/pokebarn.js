'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pokemon = require('./pokemon');

var _pokemon2 = _interopRequireDefault(_pokemon);

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

var _pokeutil = require('../pokeutil');

var _pokeutil2 = _interopRequireDefault(_pokeutil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Pokebarn = function () {
  function Pokebarn() {
    _classCallCheck(this, Pokebarn);

    this.allmon = [];
  }

  _createClass(Pokebarn, [{
    key: 'all',
    value: function all() {
      return this.allmon;
    }
  }, {
    key: 'create',
    value: function create(ident, details) {
      var res = new _pokemon2.default(ident, details);
      this.allmon.push(res);
      return res;
    }
  }, {
    key: 'find',
    value: function find(ident) {
      var searchFor = _pokeutil2.default.identWithoutPosition(ident);
      var matches = this.allmon.filter(function (mon) {
        return searchFor === mon.ident;
      });
      if (matches.length > 1) {
        _log2.default.error('Found multiple mons with the same ident! o fuck');
        _log2.default.error(matches);
      }
      return matches[0];
    }
  }, {
    key: 'findOrCreate',
    value: function findOrCreate(ident, details) {
      var mon = this.find(ident);
      if (mon) return mon;
      return this.create(ident, details);
    }

    /**
     * Sometimes Pokemon get replaced. Like when Zoroark comes to town.
     *
     * @param  {[type]} ident     [description]
     * @param  {[type]} details   [description]
     * @param  {[type]} condition [description]
     * @return {[type]}           [description]
     */

  }, {
    key: 'replace',
    value: function replace(ident, details, condition) {
      var pos = _pokeutil2.default.identToPos(ident);
      var replaced = this.findByPos(pos);
      var idx = this.allmon.indexOf(replaced);
      if (idx >= 0) {
        _log2.default.warn('Found zoroark! replacing him!');
        this.allmon.splice(idx, 1);
      } else {
        _log2.default.error('Couldnt find the thing we want to replace.');
        _log2.default.error(ident, details, condition);
      }

      var updated = this.findOrCreate(ident, details);
      updated.useCondition(condition);
      return updated;
    }

    /**
     * Find a Pokemon by its position, ex. 'p2a'
     * @param  {String} pos The position of the Pokemon.
     * @return {Pokemon} The Pokemon object.
     */

  }, {
    key: 'findByPos',
    value: function findByPos(pos) {
      return this.allmon.find(function (mon) {
        return mon.position === pos;
      });
    }
  }]);

  return Pokebarn;
}();

exports.default = Pokebarn;