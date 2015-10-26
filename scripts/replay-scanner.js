import fs from 'fs';
import BattleStore from '../src/model/battlestore';
import Report from '../src/report';
import {MongoClient, ObjectId} from 'mongodb';
const mongourl = 'mongodb://localhost:27017/test';
let mongo;

MongoClient.connect(mongourl, (err, db) => {
  if (err) return console.error(err);
  console.log('db loaded.');
  mongo = db;
});

const replay = process.argv[2];

class ReplayScanner {
  constructor(filename) {
    this.filename = filename;
    this.matchid = replay.split('/').pop();
    this.report = null;

    this.store = new BattleStore();
    this.store.myId = 'p1';

    // since it's a callback...
    this.handleResults = this.handleResults.bind(this);
  }
  processFile(data) {
    data.split('\n').forEach( line => {
      const splits = line.split('|');
      if (splits.length <= 2) return;
      const type = splits[1];
      const message = splits.slice(2);
      console.log(type, message);
      this.store.handle(type, message);

      if (type === 'win') {
        this.report = Report.win(message[0], this.store, this.matchid);
        this.handleResults();
      }
    });
  }

  handleResults() {
    if (!mongo) {
      console.error('db not ready.');
      setTimeout(this.handleResults, 1000);
      return;
    }
    console.log(this.report);
    const justone = this.report[0];
    const dbentry = Object.assign({}, {
      matchid: justone.matchid,
      won: justone.won,
      damageDone: justone.damageDone,
      damageTaken: justone.damageTaken,
      me: justone.me,
      you: justone.you,
      mine: justone.mine,
      yours: justone.yours,
    });

    mongo.collection('randombattle').insertOne(
      dbentry
    , (err, result) => {
      if (err) return console.error(err);
      console.log(result);
    });
  }
}


const rs = new ReplayScanner();
fs.readFile(replay, 'ascii', (err, data) => {
  if (err) {
    throw err;
  }
  rs.processFile(data);
});
