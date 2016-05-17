const spawn = require('child_process').spawn;
import Log from './log';

let op;

class Bot {
  decide(json) {
    const res = (resolve, reject) => {
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

const Foreigner = (script, args = [], opts = {}) => {
  op = spawn(script, args, opts);
  op.stderr.on('data', (data) => {
    Log.err(data);
  });
  return Bot;
}

export default Foreigner;
