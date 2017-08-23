const chalk = require('chalk');
const fs = require('fs');
const Log = require('../log');

const winSymbol = chalk.bold.green('✓');
const loseSymbol = chalk.bold.red('X');

class EndOfMatch {
  report(state, path) {
    let xo = '';
    let matchup = '';
    state.forEach((match) => {
      xo += (match.won) ? winSymbol : loseSymbol;
      match.myDead = match.mine.filter(mon => mon.dead).length;
      match.yourDead = match.yours.filter(mon => mon.dead).length;
      matchup += match.yourDead + '-' + match.myDead + ' ';
    });
    console.log('WINS: ' + xo);
    console.log('KOs: ' + matchup.trim());

    // write the last match to a log
    const last = state[state.length - 1];
    let out = [last.matchid, last.me, last.you, last.won, last.yourDead, last.myDead];
    out = out.join(',') + '\n';

    Log.debug('checking this path:', path);
    fs.exists(path, (exists) => {
      if (!exists) {
        out = 'matchid,me,you,won,yourDead,myDead\n' + out;
      }
      // don't worry, this creates files if they don't exist
      fs.appendFile(path, out, (err) => {
        if (err) {
          Log.error(err);
        }
      });
    });
  }
}

const eom = new EndOfMatch();
module.exports = eom;
