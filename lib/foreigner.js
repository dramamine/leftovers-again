'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var spawn = require('child_process').spawn;


var op = void 0;

var Bot = function () {
  function Bot() {
    _classCallCheck(this, Bot);
  }

  _createClass(Bot, [{
    key: 'decide',
    value: function decide(json) {
      var res = function res(resolve) {
        op.send(json);
        op.stdout.on('data', function (data) {
          console.log('got data back from my child process!');
          console.log(data);
          resolve(data);
        });
      };
      return res;
    }
  }]);

  return Bot;
}();

var foreigner = function foreigner(script) {
  var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
  var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  op = spawn(script, args, opts);
  op.stderr.on('data', function (data) {
    _log2.default.err(data);
  });
  return Bot;
};

exports.default = foreigner;