import colors from 'colors/safe';
// black
// red
// green
// yellow
// blue
// magenta
// cyan
// white
// gray
// grey

let loglevel = 3;
const argv = require('minimist')(process.argv.slice(2));
if (argv.loglevel) {
  loglevel = argv.loglevel;
}

class Log {
  debug(msg) { if (loglevel >= 5) console.log(colors.green(msg)); }
  info(msg) { if (loglevel >= 4)console.log(colors.yellow(msg)); }
  log(msg) { if (loglevel >= 3) console.log(colors.cyan(msg)); }
  warn(msg) { if (loglevel >= 2) console.log(colors.magenta(msg)); }
  err(msg) { if (loglevel >= 1) console.log(colors.red(msg)); }
  error(msg) { if (loglevel >= 1) console.error(colors.red(msg)); }
}
const log = new Log();
export default log;
