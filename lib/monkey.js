'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _connection = require('./connection');

var _connection2 = _interopRequireDefault(_connection);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _listener = require('./listener');

var _listener2 = _interopRequireDefault(_listener);

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const PORT = 7331;

/**
 * For speaking with greasemonkey scripts, when you want to run this through
 * the web client instead of the commandline.
 */
class Monkey extends _connection2.default {
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
    _log2.default.info('connection constructing.');
    const WebSocketServer = _ws2.default.Server;
    const wss = new WebSocketServer({ port: PORT });

    wss.on('connection', ws => {
      _log2.default.info('connection established.');
      this.ws = ws;
      ws.on('message', this._handleMessage);
    });

    _listener2.default.subscribe('_send', this.send.bind(this));
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
exports.default = monkey;