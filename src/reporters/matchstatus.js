const chalk = require('chalk');

const HP_BAR_LENGTH = 10;
const EXTRA_MON_ICON = 'O';
const DEAD_MON_ICON = 'X';
const UNKNOWN_MON_ICON = '?';
// const MY_BACKGROUND = chalk.bgYellow;
// const YOUR_BACKGROUND = chalk.bgCyan;
const MY_TEXT = chalk.bold.black;
const YOUR_TEXT = chalk.bold.black;
const EMPTY = '           ';

class MatchStatus {
  report(state) {
    const myLastMove = state.self.active.prevMoves
      ? state.self.active.prevMoves[0]
      : '';
    const yourLastMove = state.opponent.active.prevMoves
      ? state.opponent.active.prevMoves[0]
      : '';

    const stuff = this.padLeft(myLastMove, 12) + ' | ' +

      this.padLeft(
        this.statusString(state.self.active.statuses) + ' ' +
        this.boostString(state.self.active.boosts)
      , 15) + ' ' +

      this.padLeft(
        state.self.active.species
      , 10) + ' ' +

      this.hp(state.self.active.hppct || EMPTY) + ' | ' +

      this.myReserve(state.self.reserve) + ' | ' +
      this.yourReserve(state.opponent.reserve) + ' | ' +

      this.hp(state.opponent.active.hppct || EMPTY) + ' ' +

      this.padRight(
        state.opponent.active.species
      , 10) + ' ' +

      this.padRight(
        this.statusString(state.opponent.active.statuses) + ' ' +
        this.boostString(state.opponent.active.boosts)
      , 15) + ' | ' +

      this.padRight(yourLastMove, 12) + '';
    console.log(stuff);
  }
  hp(hppct) {
    const blox = Math.floor(hppct / HP_BAR_LENGTH);
    const antiblox = HP_BAR_LENGTH - blox;
    return chalk.bgGreen(' '.repeat(blox)) + chalk.bgRed(' '.repeat(antiblox));
  }

  statusString(statuses) {
    if (!statuses || statuses.length === 0) return '';
    if (statuses.length <= 2) {
      return '[' + statuses.join(' ') + ']';
    }
    return '[' + statuses.map(str => str.substr(0, 2)).join(' ').substr(0, 8) + ']';
  }

  boostString(boosts = {}) {
    let out = '';
    Object.keys(boosts).forEach((key) => {
      const mod = (boosts[key] > 0)
        ? '+'.repeat(boosts[key])
        : '-'.repeat(-1 * boosts[key]);
      out += key + mod + ' ';
    });
    return out.trim();
  }

  myReserve(reserve) {
    const myAlive = reserve.filter(mon => !mon.dead).length;
    const myDead = reserve.filter(mon => mon.dead).length;

    const stuff = MY_TEXT(
      this.padLeft(DEAD_MON_ICON.repeat(myDead), 6)
    );
    return stuff;
  }
  yourReserve(reserve) {
    const yourAlive = reserve.filter(mon => !mon.dead).length;
    const yourDead = reserve.filter(mon => mon.dead).length;

    const stuff = YOUR_TEXT(
      this.padRight(DEAD_MON_ICON.repeat(yourDead), 6)
    );
    return stuff;
  }

  padLeft(nr = ' ', n, str) {
    if (nr.length >= n) return nr.substr(0, n);
    return Array(n - String(nr).length + 1).join(str || ' ') + nr;
  }
  padRight(nr = ' ', n, str) {
    if (nr.length >= n) return nr.substr(0, n);
    return nr + Array(n - String(nr).length + 1).join(str || ' ');
  }
}

module.exports = new MatchStatus();
