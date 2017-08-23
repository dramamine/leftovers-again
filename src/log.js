const chalk = require('chalk');
const fs = require('fs');

// global log level. don't show messages below this severity
let loglevel = 3;

/**
 * Log class; for prettying up your log output and optionally hiding less
 * important messages.
 */
class Log {
  megadebug(msg) {
    if (loglevel >= 6) console.log(msg);
  }
  debug(msg) {
    if (loglevel >= 5) console.log(chalk.green(msg));
  }
  info(msg) {
    if (loglevel >= 4) console.log(chalk.yellow(msg));
  }
  log(msg) {
    if (loglevel >= 3) console.log(chalk.cyan(msg));
  }
  warn(msg) {
    if (loglevel >= 2) console.log(chalk.magenta(msg));
  }
  err(msg) {
    if (loglevel >= 1) console.log(chalk.red(msg));
  }
  error(msg) {
    if (loglevel >= 1) console.error(chalk.red(msg));
  }

  toFile(file, msg) {
    // const out = new Date().toUTCString() + ' ' + msg + '\n';
    fs.appendFile('log/' + file, msg + '\n', (err) => {
      if (err) console.error(err);
      return false;
    });
    return true;
  }

  /**
   * For setting the global log level.
   * @param {Int} lvl  The log level to use.
   */
  setLogLevel(lvl) {
    loglevel = lvl;
  }
}
const log = new Log();
module.exports = log;
