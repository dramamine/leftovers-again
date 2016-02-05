import chalk from 'chalk';

const winSymbol = chalk.bold.green('✓');
const loseSymbol = chalk.bold.red('X');

class EndOfMatch {
  report(state) {
    let out = '';
    console.log('eom called.');
    state.forEach(s => {
      if(s.won) {
        out += winSymbol;
      } else {
        out += loseSymbol;
      }
    });
    console.log(out);
  }
}

const eom = new EndOfMatch();
export default eom;
