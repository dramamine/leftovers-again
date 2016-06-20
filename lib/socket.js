'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _listener = require('./listener');

var _listener2 = _interopRequireDefault(_listener);

var _connection = require('./connection');

var _connection2 = _interopRequireDefault(_connection);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let ws;

class Socket extends _connection2.default {
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
      path: `/~~${ server }:${ port }/action.php`
    };

    this.nickname = nickname;
    this.password = password;
    this.chatroom = chatroom;
    this.format = format;

    this.build(`ws://${ server }:${ port }/showdown/websocket`);

    _listener2.default.subscribe('challstr', this._login.bind(this));
    _listener2.default.subscribe('updateuser', this.onUpdateUser.bind(this));
    _listener2.default.subscribe('popup', this._relayPopup);
    // defined message type for calling from battles, etc.
    _listener2.default.subscribe('_send', this.send);
  }

  /**
   * Build your socket.
   * @param  {String} addy The address of the socket.
   */
  build(addy) {
    ws = new _ws2.default(addy);

    ws.on('open', () => {
      _log2.default.info('Got open message from server\'s websocket.');
    });

    ws.on('message', this._handleMessage);

    ws.on('error', err => {
      if (err.code === 'ECONNREFUSED') {
        _log2.default.error(`ECONNREFUSED when trying to connect to server at:`);
        _log2.default.error(`${ addy }`);
        _log2.default.error(`Are you sure a server is running there?`);
        _log2.default.error(`Make sure you have the official server installed and running.\n`);
        _log2.default.error(` Using git (preferred):\n`);
        _log2.default.error(`    git clone https://github.com/Zarel/Pokemon-Showdown.git`);
        _log2.default.error(`    cd Pokemon-Showdown`);
        _log2.default.error(`    npm start\n`);
        _log2.default.error(`Running this separately will reduce startup time and allow you to read`);
        _log2.default.error(`server logs for debugging.\n`);
      }
    });
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
    // console.log(requestOptions);
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
    const req = _https2.default.request(requestOptions, res => {
      // console.log('looking at response.');
      res.setEncoding('utf8');
      let chunks = '';
      res.on('data', chunk => {
        chunks += chunk;
      });
      res.on('end', () => {
        if (chunks === ';') {
          _log2.default.error('failed to log in; nick is registered - invalid or no password given');
          process.exit(-1);
        }
        if (chunks.length < 50) {
          _log2.default.error('failed to log in: ' + chunks);
          process.exit(-1);
        }
        if (chunks.indexOf('heavy load') !== -1) {
          _log2.default.error('the login server is under heavy load; trying again in one minute');
          setTimeout(() => {
            return this._handleMessage(message);
          }, 60 * 1000);
          return;
        }
        if (chunks.substr(0, 16) === '<!DOCTYPE html>') {
          _log2.default.error('Connection error 522; trying agian in one minute');
          setTimeout(() => {
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

    req.on('error', err => {
      return _log2.default.error('login error: ' + err.stack);
    });

    if (data) {
      req.write(data);
    }
    return req.end();
  }

  _relayPopup(args) {
    _log2.default.warn('Got a popup:');
    _log2.default.warn(args);
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
exports.default = socket;