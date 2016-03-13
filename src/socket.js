import listener from 'listener';
import WebSocket from 'ws';
import url from 'url';
import Connection from 'connection';
import config from 'config';
import util from 'pokeutil';
import https from 'https';
import Log from 'log';


let ws;
const requestUrl = url.parse(config.actionurl);

class Socket extends Connection {
  constructor() {
    super();
  }

  connect({server = 'localhost', port = 8000, bot, scrappy}) {
    // console.log('connection constructed.');
    ws = new WebSocket('ws://localhost:8000/showdown/websocket');

    ws.on('open', () => {
      Log.info('got open message from websocket');
    });

    ws.on('message', this._handleMessage);

    listener.subscribe('challstr', this._login.bind(this));
    listener.subscribe('popup', this._relayPopup);
    // defined message type for calling from battles, etc.
    listener.subscribe('_send', this.send);
  }

  /**
   * this function will relay ANYTHING to the server, hope your message is
   * formatted right!
   *
   * @link https://github.com/Zarel/Pokemon-Showdown
   *
   * @param  {String} message [description]
   */
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

  _login(args) {
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
        if (chunks === ';') {
          Log.error('failed to log in; nick is registered - invalid or no password given');
          process.exit(-1);
        }
        if (chunks.length < 50) {
          Log.error('failed to log in: ' + chunks);
          process.exit(-1);
        }
        if (chunks.indexOf('heavy load') !== -1) {
          Log.error('the login server is under heavy load; trying again in one minute');
          setTimeout( () => {
            return this._handleMessage(message);
          }, 60 * 1000);
          return;
        }
        if (chunks.substr(0, 16) === '<!DOCTYPE html>') {
          Log.error('Connection error 522; trying agian in one minute');
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
      return Log.error('login error: ' + err.stack);
    });

    if (data) {
      req.write(data);
    }
    return req.end();
  }

  _relayPopup(args) {
    Log.warn('Got a popup:');
    Log.warn(args);
  }

}

const socket = new Socket();
export default socket;
