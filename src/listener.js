





class Listener {
  constructor() {
    let listeners = {};
  }

  relay(type, params) {
    if(!listeners['type']) return false;
    listeners['type'].map( (callback) => {
      callback.call(null, params);
    });
  }

  listensTo(type, callback) {
    if(!listeners.type) {
      listeners.type = [];
    }
    listeners.type.push(callback);
  }

  unsubscribe(type, callback) {
    if(!listeners.type) {
      console.warn('Listener.unsubscribe: No listeners of that type!', type);
      return false;
    }
    const idx = listeners.type.indexOf(callback);
    if(idx>=0) {
      listeners.type.splice(idx,1);
    } else {
      console.warn('Listener.unsubscribe: No listeners of that callback!',
        type, callback);
      return false;
    }
    return true;
  }
}

export default Listener;