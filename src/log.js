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


class Log {
  debug(msg) { console.log(colors.green(msg)); }
  info(msg) { console.log(colors.yellow(msg)); }
  log(msg) { console.log(colors.cyan(msg)); }
  warn(msg) { console.log(colors.magenta(msg)); }
  err(msg) { console.log(colors.red(msg)); }
  error(msg) { console.error(colors.red(msg)); }
}
const log = new Log();
export default log;
