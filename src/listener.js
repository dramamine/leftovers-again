
let listeners;
class Listener {
  constructor() {
    listeners = {};
  }

  relay(type, params) {
    // console.log(type, params);
    if (!listeners[type]) return;
    listeners[type].map( (callback) => {
      callback.call(null, params);
    });
  }

  subscribe(type, callback) {
    if (!listeners[type]) {
      listeners[type] = [];
    }
    listeners[type].push(callback);
  }

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
export default listener;
