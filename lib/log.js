'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// global log level. don't show messages below this severity
let loglevel = 3;

/**
 * Log class; for prettying up your log output and optionally hiding less
 * important messages.
 */
class Log {
  debug(msg) {
    if (loglevel >= 5) console.log(_chalk2.default.green(msg));
  }
  info(msg) {
    if (loglevel >= 4) console.log(_chalk2.default.yellow(msg));
  }
  log(msg) {
    if (loglevel >= 3) console.log(_chalk2.default.cyan(msg));
  }
  warn(msg) {
    if (loglevel >= 2) console.log(_chalk2.default.magenta(msg));
  }
  err(msg) {
    if (loglevel >= 1) console.log(_chalk2.default.red(msg));
  }
  error(msg) {
    if (loglevel >= 1) console.error(_chalk2.default.red(msg));
  }

  toFile(file, msg) {
    // const out = new Date().toUTCString() + ' ' + msg + '\n';
    _fs2.default.appendFile('log/' + file, msg + '\n', err => {
      if (err) console.error(err);
    });
    // console.log(colors.blue(msg));
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
exports.default = log;