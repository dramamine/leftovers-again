import listener from './listener';
import Battle from './battle';
import config from './config';
import log from './log';

const battles = {};

/**
 * Abstract class for managing connections. All connections are responsible
 * for handling server messages, using listeners to relay messages, and
 * tracking the battles that use their particular connection.
 */
class Connection {
  /**
   * Constructor for a Connection
   */
  constructor() {
  }

  /**
   * Connect to a thing.
   */
  connect() {
    log.error('please override me.');
  }

  /**
   * Handle a server message. These have a particular format which I won't get
   * into here; check the official repos for more information. If the message
   * came with a battle ID, make sure that battle has been constructed, and
   * relay the message to that particular battle only.
   *
   * @param  {string} msg The message from the server.
   */
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

  /**
   * Send the message to the server
   * @param  {string} message The server message.
   */
  send(message) {} // eslint-disable-line

  /**
   * [close description]
   * @param  {[type]} message [description]
   * @return {[type]}         [description]
   */
  close(message) {} // eslint-disable-line

  /**
   * Helper function to get a battle by its battle ID.
   * @param  {string} bid The battle ID, ex. 'randombattle-652742'
   * @return {Battle} The Battle object you're looking for.
   */
  _getBattle(bid) {
    if (!battles[bid]) {
      log.error('couldn\'t find a battle with that ID: ' + bid);
      return null;
    }
    return battles[bid];
  }

  /**
   * [exit description]
   * @return {[type]} [description]
   */
  exit() {}
}

export default Connection;
