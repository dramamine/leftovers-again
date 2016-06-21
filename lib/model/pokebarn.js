'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pokemon = require('./pokemon');

var _pokemon2 = _interopRequireDefault(_pokemon);

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

var _pokeutil = require('../pokeutil');

var _pokeutil2 = _interopRequireDefault(_pokeutil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Pokebarn {
  constructor() {
    this.allmon = [];
  }

  all() {
    return this.allmon;
  }

  create(ident, details) {
    const res = new _pokemon2.default(ident, details);
    this.allmon.push(res);
    return res;
  }

  find(ident) {
    const searchFor = _pokeutil2.default.identWithoutPosition(ident);
    const matches = this.allmon.filter(mon => {
      return searchFor === mon.ident;
    });
    if (matches.length > 1) {
      _log2.default.error('Found multiple mons with the same ident! o fuck');
      _log2.default.error(matches);
    }
    return matches[0];
  }

  findOrCreate(ident, details) {
    const mon = this.find(ident);
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
  replace(ident, details, condition) {
    const pos = _pokeutil2.default.identToPos(ident);
    const replaced = this.findByPos(pos);
    const idx = this.allmon.indexOf(replaced);
    if (idx >= 0) {
      _log2.default.warn('Found zoroark! replacing him!');
      this.allmon.splice(idx, 1);
    } else {
      _log2.default.error('Couldnt find the thing we want to replace.');
      _log2.default.error(ident, details, condition);
    }

    const updated = this.findOrCreate(ident, details);
    updated.useCondition(condition);
    return updated;
  }

  /**
   * Find a Pokemon by its position, ex. 'p2a'
   * @param  {String} pos The position of the Pokemon.
   * @return {Pokemon} The Pokemon object.
   */
  findByPos(pos) {
    return this.allmon.find(mon => {
      return mon.position === pos;
    });
  }

}

exports.default = Pokebarn;