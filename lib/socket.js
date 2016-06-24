'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ws = void 0;

var Socket = function (_Connection) {
  _inherits(Socket, _Connection);

  function Socket() {
    _classCallCheck(this, Socket);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Socket).call(this));
  }

  _createClass(Socket, [{
    key: 'connect',
    value: function connect(_ref) {
      var _ref$actionHost = _ref.actionHost;
      var actionHost = _ref$actionHost === undefined ? 'play.pokemonshowdown.com' : _ref$actionHost;
      var _ref$nickname = _ref.nickname;
      var nickname = _ref$nickname === undefined ? 'cyberdyne.thrall.' + Math.floor(Math.random() * 10000) : _ref$nickname;
      var _ref$password = _ref.password;
      var password = _ref$password === undefined ? null : _ref$password;
      var _ref$chatroom = _ref.chatroom;
      var chatroom = _ref$chatroom === undefined ? 'lobby' : _ref$chatroom;
      var _ref$server = _ref.server;
      var server = _ref$server === undefined ? 'localhost' : _ref$server;
      var _ref$port = _ref.port;
      var port = _ref$port === undefined ? 8000 : _ref$port;
      var format = _ref.format;

      this.actionurl = {
        host: actionHost,
        port: null,
        path: '/~~' + server + ':' + port + '/action.php'
      };

      this.nickname = nickname;
      this.password = password;
      this.chatroom = chatroom;
      this.format = format;

      this.build('ws://' + server + ':' + port + '/showdown/websocket');

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

  }, {
    key: 'build',
    value: function build(addy) {
      ws = new _ws2.default(addy);

      ws.on('open', function () {
        _log2.default.info('Got open message from server\'s websocket.');
      });

      ws.on('message', this._handleMessage);

      ws.on('error', function (err) {
        if (err.code === 'ECONNREFUSED') {
          _log2.default.error('ECONNREFUSED when trying to connect to server at:');
          _log2.default.error('' + addy);
          _log2.default.error('Are you sure a server is running there?');
          _log2.default.error('Make sure you have the official server installed and running.\n');
          _log2.default.error(' Using git (preferred):\n');
          _log2.default.error('    git clone https://github.com/Zarel/Pokemon-Showdown.git');
          _log2.default.error('    cd Pokemon-Showdown');
          _log2.default.error('    npm start\n');
          _log2.default.error('Running this separately will reduce startup time and allow you to read');
          _log2.default.error('server logs for debugging.\n');
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

  }, {
    key: 'send',
    value: function send(message) {
      ws.send(message);
    }
  }, {
    key: 'close',
    value: function close(message) {
      ws.close(message);
      if (this.chat) {
        this.chat.destroy();
        this.chat = null;
      }
    }
  }, {
    key: 'exit',
    value: function exit() {
      ws.close();
    }
  }, {
    key: '_login',
    value: function _login(args) {
      var _this2 = this;

      // console.log('responding to challenge.');

      var _args = _slicedToArray(args, 2);

      var id = _args[0];
      var str = _args[1];
      // console.log(id, str);

      var requestOptions = {
        hostname: this.actionurl.host,
        port: this.actionurl.port,
        path: this.actionurl.path,
        agent: false
      };
      // console.log(requestOptions);
      var data = '';
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
      var req = _https2.default.request(requestOptions, function (res) {
        // console.log('looking at response.');
        res.setEncoding('utf8');
        var chunks = '';
        res.on('data', function (chunk) {
          chunks += chunk;
        });
        res.on('end', function () {
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
            setTimeout(function () {
              return _this2._handleMessage(message);
            }, 60 * 1000);
            return;
          }
          if (chunks.substr(0, 16) === '<!DOCTYPE html>') {
            _log2.default.error('Connection error 522; trying agian in one minute');
            setTimeout(function () {
              return _this2._handleMessage(message);
            }, 60 * 1000);
            return;
          }
          if (chunks.indexOf('|challstr|') >= 0) {
            _this2._handleMessage(chunks);
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
          _this2.send('|/trn ' + _this2.nickname + ',0,' + chunks);
        });
      });

      req.on('error', function (err) {
        return _log2.default.error('login error: ' + err.stack);
      });

      if (data) {
        req.write(data);
      }
      return req.end();
    }
  }, {
    key: '_relayPopup',
    value: function _relayPopup(args) {
      _log2.default.warn('Got a popup:');
      _log2.default.warn(args);
    }
  }, {
    key: 'onUpdateUser',
    value: function onUpdateUser(args) {
      // this includes a 3rd parameter, i.e. "mysterycode". who knows.

      var _args2 = _slicedToArray(args, 2);

      var nick = _args2[0];
      var status = _args2[1];

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
  }]);

  return Socket;
}(_connection2.default);

var socket = new Socket();
exports.default = socket;