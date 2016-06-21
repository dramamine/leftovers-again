import chalk from 'chalk';

const winSymbol = chalk.bold.green('✓');
const loseSymbol = chalk.bold.red('X');

class EndOfMatch {
  report(state) {
    let xo = '';
    let matchup = '';
    state.forEach(match => {
      xo += (match.won) ? winSymbol : loseSymbol;
      const myDead = match.mine.filter( mon =>  mon.dead).length;
      const yourDead = match.yours.filter( mon =>  mon.dead).length;
      matchup += yourDead + '-' + myDead + ' ';
    });
    console.log('WINS: ' + xo);
    console.log('KOs: ' + matchup.trim());
  }
}

const eom = new EndOfMatch();
export default eom;
