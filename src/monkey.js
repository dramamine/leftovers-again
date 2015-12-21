import Connection from './connection';
import log from './log';
import WebSocket from 'ws';

const PORT = 7331;

class Monkey extends Connection {
  constructor() {
    super();
    this.ws = null;
  }

  connect() {
    log.info('connection constructing.');
    const WebSocketServer = WebSocket.Server;
    const wss = new WebSocketServer({ port: PORT });

    wss.on('connection', (ws) => {
      log.info('connection established.');
      this.ws = ws;
      ws.on('message', this._handleMessage);
    });
  }

  send(message) {
    this.ws.send(message);
  }

  close(message) {
    if (this.ws) {
      this.ws.close(message);
    }
  }
}

const monkey = new Monkey();
export default monkey;
