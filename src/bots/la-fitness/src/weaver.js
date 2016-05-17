import ChildProcess from 'child_process';

const statuses = {
  OPEN: 'open',
  BUSY: 'busy'
};

const threads = [];

let jobQueue = [];

// you know, bcz it ties threads together...
export default class Weaver {
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
      thread: ChildProcess.fork(__dirname + '/thread'),
      status: statuses.OPEN
    };

    result.thread.on('message', (event) => {
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
