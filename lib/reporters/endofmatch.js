'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var winSymbol = _chalk2.default.bold.green('✓');
var loseSymbol = _chalk2.default.bold.red('X');

var EndOfMatch = function () {
  function EndOfMatch() {
    _classCallCheck(this, EndOfMatch);
  }

  _createClass(EndOfMatch, [{
    key: 'report',
    value: function report(state) {
      var xo = '';
      var matchup = '';
      state.forEach(function (match) {
        xo += match.won ? winSymbol : loseSymbol;
        var myDead = match.mine.filter(function (mon) {
          return mon.dead;
        }).length;
        var yourDead = match.yours.filter(function (mon) {
          return mon.dead;
        }).length;
        matchup += yourDead + '-' + myDead + ' ';
      });
      console.log('WINS: ' + xo);
      console.log('KOs: ' + matchup.trim());
    }
  }]);

  return EndOfMatch;
}();

var eom = new EndOfMatch();
exports.default = eom;