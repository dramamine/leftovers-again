import listener from './listener';
import WebSocket from 'ws';
import url from 'url';
import Connection from './connection';
import config from './config';
import util from './util';
import https from 'https';
import Chat from './chat';

let ws;
const requestUrl = url.parse(config.actionurl);

class Socket extends Connection {
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

    listener.subscribe('challstr', this._respondToChallenge.bind(this));
    listener.subscribe('popup', this._relayPopup);

    this.chat = new Chat();
  }

  send(message) {
    ws.send(message);
  }

  close(message) {
    ws.close(message);
    if (this.chat) {
      this.chat.destroy();
      this.chat = null;
    }
  }

  exit() {
    ws.close();
  }

  _respondToChallenge(args) {
    // console.log('responding to challenge.');
    const [id, str] = args;
    // console.log(id, str);

    const requestOptions = {
      hostname: requestUrl.hostname,
      port: requestUrl.port,
      path: requestUrl.pathname,
      agent: false
    };
    let data = '';
    if (!config.pass) {
      requestOptions.method = 'GET';
      requestOptions.path += '?act=getassertion&userid=' + util.toId(config.nick) + '&challengekeyid=' + id + '&challenge=' + str;
    } else {
      requestOptions.method = 'POST';
      data = 'act=login&name=' + config.nick + '&pass=' + config.pass + '&challengekeyid=' + id + '&challenge=' + str;
      requestOptions.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
      };
    }
    const req = https.request(requestOptions, (res) => {
      // console.log('looking at response.');
      res.setEncoding('utf8');
      let chunks = '';
      res.on('data', (chunk) => {
        chunks += chunk;
      });
      res.on('end', () => {
        // console.log(chunks);
        if (chunks === ';') {
          console.error('failed to log in; nick is registered - invalid or no password given');
          process.exit(-1);
        }
        if (chunks.length < 50) {
          console.error('failed to log in: ' + chunks);
          process.exit(-1);
        }
        if (chunks.indexOf('heavy load') !== -1) {
          console.error('the login server is under heavy load; trying again in one minute');
          setTimeout( () => {
            return this._handleMessage(message);
          }, 60 * 1000);
          return;
        }
        if (chunks.substr(0, 16) === '<!DOCTYPE html>') {
          console.error('Connection error 522; trying agian in one minute');
          setTimeout( () => {
            return this._handleMessage(message);
          }, 60 * 1000);
          return;
        }
        if (chunks.indexOf('|challstr|') >= 0) {
          this._handleMessage(chunks);
          return;
        }
        // getting desparate here...
        try {
          chunks = JSON.parse(chunks.substr(1));
          if (chunks.actionsuccess) {
            chunks = chunks.assertion;
          } else {
            error('could not log in; action was not successful: ' + JSON.stringify(chunks));
            process.exit(-1);
          }
        } catch (err) {
          // probably nothing.
          // console.error('error trying to parse data:', err, chunks);
        }
        this.send('|/trn ' + config.nick + ',0,' + chunks);
      });
    });

    req.on('error', (err) => {
      return console.error('login error: ' + err.stack);
    });

    if (data) {
      req.write(data);
    }
    return req.end();
  }

}

const socket = new Socket();
export default socket;
