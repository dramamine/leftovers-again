'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// global log level. don't show messages below this severity
var loglevel = 3;

/**
 * Log class; for prettying up your log output and optionally hiding less
 * important messages.
 */

var Log = function () {
  function Log() {
    _classCallCheck(this, Log);
  }

  _createClass(Log, [{
    key: 'debug',
    value: function debug(msg) {
      if (loglevel >= 5) console.log(_chalk2.default.green(msg));
    }
  }, {
    key: 'info',
    value: function info(msg) {
      if (loglevel >= 4) console.log(_chalk2.default.yellow(msg));
    }
  }, {
    key: 'log',
    value: function log(msg) {
      if (loglevel >= 3) console.log(_chalk2.default.cyan(msg));
    }
  }, {
    key: 'warn',
    value: function warn(msg) {
      if (loglevel >= 2) console.log(_chalk2.default.magenta(msg));
    }
  }, {
    key: 'err',
    value: function err(msg) {
      if (loglevel >= 1) console.log(_chalk2.default.red(msg));
    }
  }, {
    key: 'error',
    value: function error(msg) {
      if (loglevel >= 1) console.error(_chalk2.default.red(msg));
    }
  }, {
    key: 'toFile',
    value: function toFile(file, msg) {
      // const out = new Date().toUTCString() + ' ' + msg + '\n';
      _fs2.default.appendFile('log/' + file, msg + '\n', function (err) {
        if (err) console.error(err);
        return false;
      });
      return true;
    }

    /**
     * For setting the global log level.
     * @param {Int} lvl  The log level to use.
     */

  }, {
    key: 'setLogLevel',
    value: function setLogLevel(lvl) {
      loglevel = lvl;
    }
  }]);

  return Log;
}();

var log = new Log();
exports.default = log;