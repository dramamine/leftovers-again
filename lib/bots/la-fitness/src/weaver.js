'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const statuses = {
  OPEN: 'open',
  BUSY: 'busy'
};

const threads = [];

let jobQueue = [];

// you know, bcz it ties threads together...
class Weaver {
  constructor(numThreads = 8) {
    console.log('constructing weaver.');
    for (let i = 0; i < numThreads; i++) {
      threads.push(this.spawnThread());
    }

    this.unevaluated = [];
    this.evaluated = [];
  }

  useCallback(fn) {
    this.callback = fn;
  }

  useEmpty(fn) {
    this.empty = fn;
  }

  enqueue(job) {
    const open = threads.find(thread => thread.status === statuses.OPEN);
    if (open) {
      open.status = statuses.BUSY;
      open.thread.send({
        type: 'evaluate',
        args: job
      });
    } else {
      jobQueue.push(job);
    }
  }

  die() {
    this.callback = null;
    this.empty = null;
    jobQueue = [];
  }

  spawnThread() {
    const result = {
      thread: _child_process2.default.fork(__dirname + '/thread'),
      status: statuses.OPEN
    };

    result.thread.on('message', event => {
      switch (event.type) {
        case 'result':
          // console.log('sw8, got my response from the thread.', event);
          const evaluated = event.evaluated;
          // console.log(evaluated.fitness);
          if (this.callback) {
            this.callback([evaluated]);
          }

          // get next job
          const job = jobQueue.pop();
          if (!job) {
            result.status = statuses.OPEN;
            if (this.useEmpty) this.useEmpty();
          } else {
            result.thread.send({
              type: 'evaluate',
              args: job
            });
          }

          // result.status = statuses.OPEN;
          break;
        default:
          break;
      }
    });
    return result;
  }
}
exports.default = Weaver;