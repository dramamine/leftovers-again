import chalk from 'chalk';

const HP_BAR_LENGTH = 10;
const EXTRA_MON_ICON = 'O';
const DEAD_MON_ICON = 'X';
const UNKNOWN_MON_ICON = '?';
const MY_BACKGROUND = chalk.bgYellow;
const YOUR_BACKGROUND = chalk.bgCyan;
const MY_TEXT = chalk.bold.black;
const YOUR_TEXT = chalk.bold.black;

class Reporter {
  report(state) {
    const stuff = `${this.myReserve(state)} ${this.myStatuses(state)} ${this.yourStatuses(state)} ${this.yourReserve(state)}`;
    console.log(stuff);
  }

  myStatuses(state) {
    return this.padLeft(this.statusString(state.self.active.conditions), 10);
  }
  yourStatuses(state) {
    return this.padRight(this.statusString(state.opponent.active.conditions), 10);
  }
  statusString(statuses) {
    if (!statuses || statuses.length === 0) return '          ';
    if (statuses.length <= 2) {
      return '[' + statuses.join(' ') + ']';
    }
    return '[' + statuses.map(str => str.substr(0, 2)).join(' ').substr(0, 8) + ']';
  }

  myReserve(state) {
    const myAlive = state.self.reserve.filter( mon => {
      return !mon.dead;
    }).length;
    const myDead = state.self.reserve.filter( mon => {
      return mon.dead;
    }).length;

    const stuff = MY_BACKGROUND( MY_TEXT(
      this.padLeft(DEAD_MON_ICON.repeat(myDead) + EXTRA_MON_ICON.repeat(myAlive), 6)
    ));
    return stuff;
  }
  yourReserve(state) {
    const yourAlive = state.opponent.reserve.filter( mon => {
      return !mon.dead;
    }).length;
    const yourDead = state.opponent.reserve.filter( mon => {
      return mon.dead;
    }).length;

    const stuff = YOUR_BACKGROUND( YOUR_TEXT(
      this.padRight(EXTRA_MON_ICON.repeat(yourAlive) + DEAD_MON_ICON.repeat(yourDead), 6, UNKNOWN_MON_ICON)
    ));
    return stuff;
  }

  padLeft(nr, n, str) {
    return Array(n-String(nr).length+1).join(str||' ')+nr;
  }
  padRight(nr, n, str) {
    return nr + Array(n-String(nr).length+1).join(str||' ');
  }
}

let reporter = new Reporter();
export default reporter;
