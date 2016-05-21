'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const spawn = require('child_process').spawn;


let op;

class Bot {
  decide(json) {
    const res = resolve => {
      op.send(json);
      op.stdout.on('data', data => {
        console.log('got data back from my child process!');
        console.log(data);
        resolve(data);
      });
    };
    return res;
  }
}

const foreigner = (script, args = [], opts = {}) => {
  op = spawn(script, args, opts);
  op.stderr.on('data', data => {
    _log2.default.err(data);
  });
  return Bot;
};

exports.default = foreigner;