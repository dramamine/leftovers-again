import listener from 'listener';
import WebSocket from 'ws';
import Connection from 'connection';
import https from 'https';
import Log from 'log';

let ws;

class Socket extends Connection {
  constructor() {
    super();
  }

  connect({
    actionHost = 'play.pokemonshowdown.com',
    nickname = 'cyberdyne.thrall.' + Math.floor(Math.random() * 10000),
    password = null,
    chatroom = 'lobby',
    server = 'localhost',
    port = 8000,
    format
  }) {
    this.actionurl = {
      host: actionHost,
      port: null,
      path: `/~~${server}:${port}/action.php`
    };

    this.nickname = nickname;
    this.password = password;
    this.chatroom = chatroom;
    this.format = format;

    // console.log('connection constructed.');
    ws = new WebSocket(`ws://${server}:${port}/showdown/websocket`);

    ws.on('open', () => {
      Log.info('got open message from websocket');
    });

    ws.on('message', this._handleMessage);

    listener.subscribe('challstr', this._login.bind(this));
    listener.subscribe('updateuser', this.onUpdateUser.bind(this));
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
      hostname: this.actionurl.host,
      port: this.actionurl.port,
      path: this.actionurl.path,
      agent: false
    };
    console.log(requestOptions);
    let data = '';
    if (!this.password) {
      requestOptions.method = 'GET';
      requestOptions.path += '?act=getassertion&userid=' + encodeURI(this.nickname) + '&challengekeyid=' + id + '&challenge=' + str;
    } else {
      requestOptions.method = 'POST';
      data = 'act=login&name=' + encodeURI(this.nickname) + '&pass=' + encodeURI(this.password) + '&challengekeyid=' + id + '&challenge=' + str;
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
        this.send('|/trn ' + this.nickname + ',0,' + chunks);
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

  onUpdateUser(args) {
    // this includes a 3rd parameter, i.e. "mysterycode". who knows.
    const [nick, status] = args;
    if (status !== '1') {
      // console.error(`failed to log in, still guest (status code ${status})`);
      return false;
    }
    if (nick !== this.nickname) {
      console.error('nickname was ', nick, ' expecting ', this.nickname);
      return false;
    }

    socket.send('|/join ' + this.chatroom);

    // also try to join a room according to our battle format
    if (this.format) socket.send('|/join ' + this.format);
  }

}

const socket = new Socket();
export default socket;
