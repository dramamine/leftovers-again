'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _battlestore = require('../src/model/battlestore');

var _battlestore2 = _interopRequireDefault(_battlestore);

var _report = require('../src/report');

var _report2 = _interopRequireDefault(_report);

var _mongodb = require('mongodb');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const mongourl = 'mongodb://localhost:27017/test';
const BATCH_SIZE = 1000;
const BATCH_WAIT = 1000;
let lastResearched;
let stack = 0;
let completed = 0;
let mongo;

// 18:36 => xx:xx with 1000/1000

_mongodb.MongoClient.connect(mongourl, (err, db) => {
  if (err) return console.error(err);
  console.log('db loaded.');
  mongo = db;

  lookupLastResearched();
});

class ReplayScanner {
  constructor() {}
  processFile(data, file) {
    const store = new _battlestore2.default();
    store.myId = 'p1';

    data.split('\n').forEach(line => {
      const splits = line.split('|');
      if (splits.length <= 2) return;
      const type = splits[1];
      const message = splits.slice(2);
      store.handle(type, message);

      if (type === 'win') {
        const report = _report2.default.win(message[0], store, file.split('/').pop());
        this.handleResults(report);
      }
    });
  }

  handleResults(report, ref = this) {
    if (!mongo) {
      console.error('db not ready.');
      setTimeout(ref.handleResults, 1000, report, this);
      return;
    }
    const justone = report;
    const dbentry = Object.assign({}, {
      matchid: justone.matchid,
      won: justone.won,
      damageDone: justone.damageDone,
      damageTaken: justone.damageTaken,
      me: justone.me,
      you: justone.you,
      mine: justone.mine,
      yours: justone.yours
    });

    mongo.collection('randombattle').insertOne(dbentry, (err, result) => {
      if (err) return console.error(err);
      // console.log(result.insertedId);
      // console.log('saved a randombattle result.');
    });
    // console.log('using this as ref:', ref);
    ref.saveEvents(justone.events, justone.matchid);
  }

  saveEvents(events, matchid) {
    // console.log(matchid + ': saving results');

    const filtered = events.filter(event => {
      return event.type !== 'damage';
    });
    const modded = filtered.map(event => {
      event.matchid = matchid;
      return event;
    });

    mongo.collection('events').insert(modded, (err, result) => {
      if (err) {
        return console.error(err, result);
      }
      // console.log('event inserted:', result);
    });
  }
}

const fileReader = file => {
  // console.log('gonna read file ', file);
  const rs = new ReplayScanner(file);
  _fs2.default.readFile(file, 'ascii', (err, data) => {
    if (err) {
      throw err;
    }
    rs.processFile(data, file);
    // console.log('done reading file ', file);
    completed++;
    stack--;
  });
};

const lookupLastResearched = () => {
  const options = { 'sort': [['matchid', 'desc']] };
  mongo.collection('randombattle').findOne({}, options, (err, doc) => {
    // ex. if collection doesn't exist yet
    if (doc) {
      lastResearched = doc.matchid;
    }

    globForReplays();
  });
};

const globForReplays = () => {
  (0, _glob2.default)('replays/replays/randombattle-*', [], (err, replays) => {
    if (err) return console.log(err);
    let startWith = 0;
    if (lastResearched) {
      startWith = replays.findIndex(replay => {
        return replay.indexOf(lastResearched) > 0;
      }) + 1; // solves our -1 issue and skips the one we found!
    }

    const stagger = idx => {
      if (stack > 1500) {
        // come back later
        console.log('coming back later.');
        setTimeout(stagger, BATCH_WAIT, idx);
        return;
      }

      console.log('stagger called with ', idx);
      if (idx >= replays.length) return;
      for (let i = idx; i < replays.length && i < idx + BATCH_SIZE; i++) {
        stack++;
        fileReader(replays[i]);
      }
      console.log(`waiting ${ BATCH_WAIT }ms with stack ${ stack } and idx ${ idx } and completed ${ completed }`);
      setTimeout(stagger, BATCH_WAIT, idx + BATCH_SIZE);
    };

    stagger(startWith);
  });
};