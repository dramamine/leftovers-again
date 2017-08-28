
// keeper of our listeners
let listeners;
/**
 * Listener class, for when you want to get server messages.
 */
class Listener {
  /**
   * Listener constructor.
   */
  constructor() {
    listeners = {};
    this.battlemanager = null;
  }

  use(mgr) {
    this.battlemanager = mgr;
  }

  /**
   * Have your connection call this to send the message to all registered
   * listeners.
   *
   * @param  {String} type   The message type.
   * @param  {Array} params  The parameters that came with this message.
   */
  relay(type, params, battleid = null) {
    if (battleid) {
      this.battlemanager.find(battleid).handle(type, params);
    }

    if (!listeners[type]) return;
    listeners[type].forEach((callback) => {
      callback.call(null, params);
    });
  }

  /**
   * Subscribe to this type of message.
   * @param  {String}   type     The message type.
   * @param  {Function} callback The function to call, when we get a message
   *                             of 'type'. Will be called with whatever
   *                             parameters came with the message.
   */
  subscribe(type, callback) {
    if (!listeners[type]) {
      listeners[type] = [];
    }
    listeners[type].push(callback);
  }

  /**
   * Get placed on the do-not-call list.
   *
   * This probably won't work with anonymous functions so don't try it.
   *
   * @param  {String}   type     The message type.
   * @param  {Function} callback The callback function you're no longer calling.
   * @return True if it found and unsubscribed you; false if it's kinda like
   * those phone calls you get about your small business & home security system.
   */
  unsubscribe(type, callback) {
    if (!listeners[type]) {
      return false;
    }
    const idx = listeners[type].indexOf(callback);
    if (idx >= 0) {
      listeners[type].splice(idx, 1);
    } else {
      return false;
    }
    return true;
  }
}

const listener = new Listener();
module.exports = listener;
