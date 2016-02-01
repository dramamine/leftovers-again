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
    const myr = this.myReserve(state.self.reserve);
    const yor = this.yourReserve(state.opponent.reserve);
    const mys = this.myStatuses(state.self.active.conditions);
    const yos = this.myStatuses(state.opponent.active.conditions);
    const myHp = this.hp(state.self.active.hppct);
    const yourHp = this.hp(state.opponent.active.hppct);
    const mySpecies = this.padLeft(state.self.active.species, 10);
    const yourSpecies = this.padRight(state.opponent.active.species, 10);
    const stuff = `${myr} ${mys} ${mySpecies} ${myHp} | ${yourHp} ${yourSpecies} ${yos} ${yor}`;
    console.log(stuff);
  }
  hp(hppct) {
    const blox = Math.floor(hppct / HP_BAR_LENGTH);
    const antiblox = HP_BAR_LENGTH - blox;
    return chalk.bgGreen(' '.repeat(blox)) + chalk.bgRed(' '.repeat(antiblox));
  }

  myStatuses(conditions) {
    return this.padLeft(this.statusString(conditions), 10);
  }
  yourStatuses(conditions) {
    return this.padRight(this.statusString(conditions), 10);
  }
  statusString(statuses) {
    if (!statuses || statuses.length === 0) return '          ';
    if (statuses.length <= 2) {
      return '[' + statuses.join(' ') + ']';
    }
    return '[' + statuses.map(str => str.substr(0, 2)).join(' ').substr(0, 8) + ']';
  }

  myReserve(reserve) {
    const myAlive = reserve.filter( mon => {
      return !mon.dead;
    }).length;
    const myDead = reserve.filter( mon => {
      return mon.dead;
    }).length;

    const stuff = MY_BACKGROUND( MY_TEXT(
      this.padLeft(DEAD_MON_ICON.repeat(myDead) + EXTRA_MON_ICON.repeat(myAlive), 6)
    ));
    return stuff;
  }
  yourReserve(reserve) {
    const yourAlive = reserve.filter( mon => {
      return !mon.dead;
    }).length;
    const yourDead = reserve.filter( mon => {
      return mon.dead;
    }).length;

    const stuff = YOUR_BACKGROUND( YOUR_TEXT(
      this.padRight(EXTRA_MON_ICON.repeat(yourAlive) + DEAD_MON_ICON.repeat(yourDead), 6, UNKNOWN_MON_ICON)
    ));
    return stuff;
  }

  padLeft(nr, n, str) {
    if (nr.length >= n) return nr.substr(0, n);
    return Array(n-String(nr).length+1).join(str||' ')+nr;
  }
  padRight(nr, n, str) {
    if (nr.length >= n) return nr.substr(0, n);
    return nr + Array(n-String(nr).length+1).join(str||' ');
  }
}

let reporter = new Reporter();
export default reporter;
