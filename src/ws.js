import listener from './listener';
import WebSocket from 'ws';
import Connection from './connection';

let ws;

class WebsocketConnection extends Connection {
  constructor() {
    super();
  }

  connect() {
    // console.log('connection constructed.');
    ws = new WebSocket('ws://localhost:8000/showdown/websocket');

    ws.on('open', () => {
      console.log('got open message from websocket');
    });

    ws.on('message', this._handleMessage);

    listener.subscribe('challstr', this._respondToChallenge);
    listener.subscribe('popup', this._relayPopup);
  }

  send(message) {
    ws.send(message);
  }

  close(message) {
    ws.close(message);
  }

  exit() {
    ws.close();
  }
}

const wsConnection = new WebsocketConnection();
export default wsConnection;
