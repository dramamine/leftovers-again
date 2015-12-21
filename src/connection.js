import listener from './listener';
import Battle from './battle';
import config from './config';

const battles = {};

class Connection {
  constructor() {
  }

  connect() {
    console.log('please override me.');
  }

  _handleMessage(msg) {
    // console.log('received: %s', msg);
    const messages = msg.split('\n');
    let bid = null;
    if (messages[0].indexOf('>') === 0) {
      bid = messages[0].split('>')[1];
      if (!battles[bid]) battles[bid] = new Battle(bid, this, config.botPath);
    }

    for (let i = 0; i < messages.length; i++) {
      if (messages[i].indexOf('|') === 0) {
        const messageParts = messages[i].split('|');
        let passThese = messageParts.slice(2);
        if (bid) {
          if (messageParts[1] === 'request') {
            passThese = [passThese.join('')];
          }
          battles[bid].handle(messageParts[1], passThese);
          continue;
        }
        listener.relay(messageParts[1], passThese);
      }
    }
  }

  send(message) {} // eslint-disable-line

  close(message) {} // eslint-disable-line

  _getBattle(bid) {
    return battles[bid];
  }

  _relayPopup(args) {
    console.log(args);
  }

  exit() {}
}

export default Connection;
