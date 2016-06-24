'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _connection = require('./connection');

var _connection2 = _interopRequireDefault(_connection);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _listener = require('./listener');

var _listener2 = _interopRequireDefault(_listener);

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PORT = 7331;

/**
 * For speaking with greasemonkey scripts, when you want to run this through
 * the web client instead of the commandline.
 */

var Monkey = function (_Connection) {
  _inherits(Monkey, _Connection);

  /**
   * Monkey constructor.
   */

  function Monkey() {
    _classCallCheck(this, Monkey);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Monkey).call(this));

    _this.ws = null;
    return _this;
  }

  /**
   * Create a websocket server. We will receive messages from this server.
   *
   */


  _createClass(Monkey, [{
    key: 'connect',
    value: function connect() {
      var _this2 = this;

      _log2.default.info('connection constructing.');
      var WebSocketServer = _ws2.default.Server;
      var wss = new WebSocketServer({ port: PORT });

      wss.on('connection', function (ws) {
        _log2.default.info('connection established.');
        _this2.ws = ws;
        ws.on('message', _this2._handleMessage);
      });

      _listener2.default.subscribe('_send', this.send.bind(this));
    }

    /**
     * Send messages to our client.
     *
     * @param  {string} message The message for the client.
     */

  }, {
    key: 'send',
    value: function send(message) {
      this.ws.send(message);
    }

    /**
     * Close our websocket connection.
     *
     * @param  {string} message The message to send to the client(?)
     */

  }, {
    key: 'close',
    value: function close(message) {
      if (this.ws) {
        this.ws.close(message);
      }
    }
  }]);

  return Monkey;
}(_connection2.default);

var monkey = new Monkey();
exports.default = monkey;