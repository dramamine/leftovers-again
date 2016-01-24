import colors from 'colors/safe';
// black, red, green, yellow, blue, magenta, cyan, white, gray, grey

import fs from 'fs';

let loglevel = 3;
// sorry for checking these here.
const argv = require('minimist')(process.argv.slice(2));
if (argv.loglevel) {
  loglevel = argv.loglevel;
}

/**
 * Log class; for prettying up your log output and optionally hiding less
 * important messages.
 */
class Log {
  debug(msg) { if (loglevel >= 5) console.log(colors.green(msg)); }
  info(msg) { if (loglevel >= 4)console.log(colors.yellow(msg)); }
  log(msg) { if (loglevel >= 3) console.log(colors.cyan(msg)); }
  warn(msg) { if (loglevel >= 2) console.log(colors.magenta(msg)); }
  err(msg) { if (loglevel >= 1) console.log(colors.red(msg)); }
  error(msg) { if (loglevel >= 1) console.error(colors.red(msg)); }

  toFile(file, msg) {
    // const out = new Date().toUTCString() + ' ' + msg + '\n';
    const out = msg + ',';
    fs.appendFile( 'log/' + file, out, (err) => {
      if (err) console.error(err);
    });
    console.log(colors.blue(msg));
  }
}
const log = new Log();
export default log;
