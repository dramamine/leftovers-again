'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HP_BAR_LENGTH = 10;
var EXTRA_MON_ICON = 'O';
var DEAD_MON_ICON = 'X';
var UNKNOWN_MON_ICON = '?';
var MY_BACKGROUND = _chalk2.default.bgYellow;
var YOUR_BACKGROUND = _chalk2.default.bgCyan;
var MY_TEXT = _chalk2.default.bold.black;
var YOUR_TEXT = _chalk2.default.bold.black;
var EMPTY = '           ';

var MatchStatus = function () {
  function MatchStatus() {
    _classCallCheck(this, MatchStatus);
  }

  _createClass(MatchStatus, [{
    key: 'report',
    value: function report(state) {
      var myLastMove = state.self.active.prevMoves ? state.self.active.prevMoves[0] : '';
      var yourLastMove = state.opponent.active.prevMoves ? state.opponent.active.prevMoves[0] : '';

      var stuff = this.padLeft(myLastMove, 12) + ' | ' + this.padLeft(this.statusString(state.self.active.statuses) + ' ' + this.boostString(state.self.active.boosts), 15) + ' ' + this.padLeft(state.self.active.species, 10) + ' ' + this.hp(state.self.active.hppct || EMPTY) + ' | ' + this.myReserve(state.self.reserve) + ' | ' + this.yourReserve(state.opponent.reserve) + ' | ' + this.hp(state.opponent.active.hppct || EMPTY) + ' ' + this.padRight(state.opponent.active.species, 10) + ' ' + this.padRight(this.statusString(state.opponent.active.statuses) + ' ' + this.boostString(state.opponent.active.boosts), 15) + ' | ' + this.padRight(yourLastMove, 12) + '';
      console.log(stuff);
    }
  }, {
    key: 'hp',
    value: function hp(hppct) {
      var blox = Math.floor(hppct / HP_BAR_LENGTH);
      var antiblox = HP_BAR_LENGTH - blox;
      return _chalk2.default.bgGreen(' '.repeat(blox)) + _chalk2.default.bgRed(' '.repeat(antiblox));
    }
  }, {
    key: 'statusString',
    value: function statusString(statuses) {
      if (!statuses || statuses.length === 0) return '';
      if (statuses.length <= 2) {
        return '[' + statuses.join(' ') + ']';
      }
      return '[' + statuses.map(function (str) {
        return str.substr(0, 2);
      }).join(' ').substr(0, 8) + ']';
    }
  }, {
    key: 'boostString',
    value: function boostString() {
      var boosts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var out = '';
      Object.keys(boosts).forEach(function (key) {
        var mod = boosts[key] > 0 ? '+'.repeat(boosts[key]) : '-'.repeat(-1 * boosts[key]);
        out += key + mod + ' ';
      });
      return out.trim();
    }
  }, {
    key: 'myReserve',
    value: function myReserve(reserve) {
      var myAlive = reserve.filter(function (mon) {
        return !mon.dead;
      }).length;
      var myDead = reserve.filter(function (mon) {
        return mon.dead;
      }).length;

      var stuff = MY_BACKGROUND(MY_TEXT(this.padLeft(DEAD_MON_ICON.repeat(myDead) + EXTRA_MON_ICON.repeat(myAlive), 6)));
      return stuff;
    }
  }, {
    key: 'yourReserve',
    value: function yourReserve(reserve) {
      var yourAlive = reserve.filter(function (mon) {
        return !mon.dead;
      }).length;
      var yourDead = reserve.filter(function (mon) {
        return mon.dead;
      }).length;

      var stuff = YOUR_BACKGROUND(YOUR_TEXT(this.padRight(EXTRA_MON_ICON.repeat(yourAlive) + DEAD_MON_ICON.repeat(yourDead), 6, UNKNOWN_MON_ICON)));
      return stuff;
    }
  }, {
    key: 'padLeft',
    value: function padLeft() {
      var nr = arguments.length <= 0 || arguments[0] === undefined ? ' ' : arguments[0];
      var n = arguments[1];
      var str = arguments[2];

      if (nr.length >= n) return nr.substr(0, n);
      return Array(n - String(nr).length + 1).join(str || ' ') + nr;
    }
  }, {
    key: 'padRight',
    value: function padRight() {
      var nr = arguments.length <= 0 || arguments[0] === undefined ? ' ' : arguments[0];
      var n = arguments[1];
      var str = arguments[2];

      if (nr.length >= n) return nr.substr(0, n);
      return nr + Array(n - String(nr).length + 1).join(str || ' ');
    }
  }]);

  return MatchStatus;
}();

exports.default = new MatchStatus();