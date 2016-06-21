'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const winSymbol = _chalk2.default.bold.green('✓');
const loseSymbol = _chalk2.default.bold.red('X');

class EndOfMatch {
  report(state) {
    let xo = '';
    let matchup = '';
    state.forEach(match => {
      xo += match.won ? winSymbol : loseSymbol;
      const myDead = match.mine.filter(mon => mon.dead).length;
      const yourDead = match.yours.filter(mon => mon.dead).length;
      matchup += yourDead + '-' + myDead + ' ';
    });
    console.log('WINS: ' + xo);
    console.log('KOs: ' + matchup.trim());
  }
}

const eom = new EndOfMatch();
exports.default = eom;