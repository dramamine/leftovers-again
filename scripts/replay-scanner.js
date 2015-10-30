import fs from 'fs';
import glob from 'glob';
import BattleStore from '../src/model/battlestore';
import Report from '../src/report';
import {MongoClient} from 'mongodb';
const mongourl = 'mongodb://localhost:27017/test';
let mongo;

MongoClient.connect(mongourl, (err, db) => {
  if (err) return console.error(err);
  console.log('db loaded.');
  mongo = db;
});

class ReplayScanner {
  constructor() {
  }
  processFile(data, file) {
    const store = new BattleStore();
    store.myId = 'p1';

    data.split('\n').forEach( line => {
      const splits = line.split('|');
      if (splits.length <= 2) return;
      const type = splits[1];
      const message = splits.slice(2);
      store.handle(type, message);

      if (type === 'win') {
        const report = Report.win(message[0], store, file.split('/').pop() );
        this.handleResults(report);
      }
    });
  }

  handleResults(report) {
    if (!mongo) {
      console.error('db not ready.');
      setTimeout(this.handleResults, 1000, report);
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

    mongo.collection('randombattle').insertOne(
      dbentry
    , (err, result) => {
      if (err) return console.error(err);
      // console.log(result.insertedId);
      console.log('saved a randombattle result.');
    });

    this.saveEvents(justone.events, justone.matchid);
  }

  saveEvents(events, matchid) {
    console.log(matchid + ': saving results');

    const filtered = events.filter( (event) => {
      return event.type !== 'damage';
    });
    const modded = filtered.map( (event) => {
      event.matchid = matchid;
      return event;
    });

    mongo.collection('events').insert(
      modded
    , (err, result) => {
      if (err) {
        return console.error(err, result);
      }
      console.log('event inserted:', result);
    });
  }
}


const fileReader = (file) => {
  console.log('gonna read file ', file);
  const rs = new ReplayScanner(file);
  fs.readFile(file, 'ascii', (err, data) => {
    if (err) {
      throw err;
    }
    rs.processFile(data, file);
    console.log('done reading file ', file);
  });
};

const replays = glob.sync('replays/randombattle-*');
replays.forEach( replay => {
  setTimeout(fileReader, 1000, replay);
});
