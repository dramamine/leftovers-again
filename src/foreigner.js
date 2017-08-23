const Log = require('./log');

const { spawn } = require('child_process');

let op;

class Bot {
  static decide(json) {
    const res = (resolve) => {
      op.send(json);
      op.stdout.on('data', (data) => {
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
  op.stderr.on('data', (data) => {
    Log.err(data);
  });
  return Bot;
};

module.exports = foreigner;
