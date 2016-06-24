'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _listener = require('./listener');

var _listener2 = _interopRequireDefault(_listener);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Abstract class for managing connections. All connections are responsible
 * for handling server messages, using listeners to relay messages, and
 * tracking the battles that use their particular connection.
 */

var Connection = function () {
  /**
   * Constructor for a Connection
   */

  function Connection() {
    _classCallCheck(this, Connection);
  }

  /**
   * Connect to a thing.
   */


  _createClass(Connection, [{
    key: 'connect',
    value: function connect() {
      _log2.default.error('please override me.');
    }

    /**
     * Handle a server message. These have a particular format which I won't get
     * into here; check the official repos for more information. If the message
     * came with a battle ID, make sure that battle has been constructed, and
     * relay the message to that particular battle only.
     *
     * @param  {string} msg The message from the server.
     */

  }, {
    key: '_handleMessage',
    value: function _handleMessage(msg) {
      // console.log('received: %s', msg);
      var messages = msg.split('\n');
      var bid = null;
      if (messages[0].indexOf('>') === 0) {
        bid = messages[0].split('>')[1];
      }

      for (var i = 0; i < messages.length; i++) {
        if (messages[i].indexOf('|') === 0) {
          var messageParts = messages[i].split('|');
          var passThese = messageParts.slice(2);
          if (bid) {
            if (messageParts[1] === 'request') {
              passThese = [passThese.join('')];
            }
            _listener2.default.relay(messageParts[1], passThese, bid);
          } else {
            _listener2.default.relay(messageParts[1], passThese);
          }
        }
      }
    }

    /**
     * Send the message to the server
     * @param  {string} message The server message.
     */

  }, {
    key: 'send',
    value: function send(message) {} // eslint-disable-line

    /**
     * [close description]
     * @param  {[type]} message [description]
     * @return {[type]}         [description]
     */

  }, {
    key: 'close',
    value: function close(message) {} // eslint-disable-line

    /**
     * [exit description]
     * @return {[type]} [description]
     */

  }, {
    key: 'exit',
    value: function exit() {}
  }]);

  return Connection;
}();

exports.default = Connection;