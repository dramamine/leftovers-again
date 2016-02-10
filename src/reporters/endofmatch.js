import chalk from 'chalk';

const winSymbol = chalk.bold.green('✓');
const loseSymbol = chalk.bold.red('X');

class EndOfMatch {
  report(state) {
    let xo = '';
    let matchup = '';
    state.forEach(s => {
      if (s.won) {
        xo += winSymbol;
      } else {
        xo += loseSymbol;
      }

      matchup += s.myAlive + '-' + s.yourAlive + ' ';
    });
    console.log(xo + ' ' + matchup.trim());
  }
}

const eom = new EndOfMatch();
export default eom;
