"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// keeper of our listeners
var listeners = void 0;
/**
 * Listener class, for when you want to get server messages.
 */

var Listener = function () {
  /**
   * Listener constructor.
   */

  function Listener() {
    _classCallCheck(this, Listener);

    listeners = {};
    this.battlemanager = null;
  }

  _createClass(Listener, [{
    key: "use",
    value: function use(mgr) {
      this.battlemanager = mgr;
    }

    /**
     * Have your connection call this to send the message to all registered
     * listeners.
     *
     * @param  {String} type   The message type.
     * @param  {Array} params  The parameters that came with this message.
     */

  }, {
    key: "relay",
    value: function relay(type, params) {
      var battleid = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      if (battleid) {
        this.battlemanager.find(battleid).handle(type, params);
      }

      if (!listeners[type]) return;
      listeners[type].map(function (callback) {
        callback.call(null, params);
      });
    }

    /**
     * Subscribe to this type of message.
     * @param  {String}   type     The message type.
     * @param  {Function} callback The function to call, when we get a message
     *                             of 'type'. Will be called with whatever
     *                             parameters came with the message.
     */

  }, {
    key: "subscribe",
    value: function subscribe(type, callback) {
      if (!listeners[type]) {
        listeners[type] = [];
      }
      listeners[type].push(callback);
    }

    /**
     * Get placed on the do-not-call list.
     *
     * This probably won't work with anonymous functions so don't try it.
     *
     * @param  {String}   type     The message type.
     * @param  {Function} callback The callback function you're no longer calling.
     * @return True if it found and unsubscribed you; false if it's kinda like
     * those phone calls you get about your small business & home security system.
     */

  }, {
    key: "unsubscribe",
    value: function unsubscribe(type, callback) {
      if (!listeners[type]) {
        return false;
      }
      var idx = listeners[type].indexOf(callback);
      if (idx >= 0) {
        listeners[type].splice(idx, 1);
      } else {
        return false;
      }
      return true;
    }
  }]);

  return Listener;
}();

var listener = new Listener();
exports.default = listener;