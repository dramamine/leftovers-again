const WebSocket = require('ws');
const Connection = require('./connection');
const log = require('./log');
const listener = require('./listener');

const PORT = 7331;

/**
 * For speaking with greasemonkey scripts, when you want to run this through
 * the web client instead of the commandline.
 */
class Monkey extends Connection {
  /**
   * Monkey constructor.
   */
  constructor() {
    super();
    this.ws = null;
  }

  /**
   * Create a websocket server. We will receive messages from this server.
   *
   */
  connect() {
    log.info('connection constructing.');
    const WebSocketServer = WebSocket.Server;
    const wss = new WebSocketServer({
      port: PORT
    });

    wss.on('connection', (ws) => {
      log.info('connection established.');
      this.ws = ws;
      ws.on('message', this.handleMessage);
    });

    listener.subscribe('_send', this.send.bind(this));
  }

  /**
   * Send messages to our client.
   *
   * @param  {string} message The message for the client.
   */
  send(message) {
    this.ws.send(message);
  }

  /**
   * Close our websocket connection.
   *
   * @param  {string} message The message to send to the client(?)
   */
  close(message) {
    if (this.ws) {
      this.ws.close(message);
    }
  }
}

const monkey = new Monkey();
module.exports = monkey;
