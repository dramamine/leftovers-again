
/**
 * @TODO documentation
 */
class Timer {
  constructor() {
    this.timeout = null;
  }
  after(cb, seconds) {
    this.cb = cb;
    this.seconds = seconds;
    this.ping(); // cancel existing timeout
    this.timeout = setTimeout(cb, seconds);
  }
  ping() {
    if (this.timeout) {
      clearTimeout(this.cb, this.seconds);
    }
  }

}

module.exports = Timer;