import fs from 'fs';
import BattleStore from '../src/model/battlestore';
import Report from '../src/report';

const replay = process.argv[2];

class ReplayScanner {
  constructor() {
    // this.battle = new Battle(null, {send: () => {}}, './ai');
    // Battle.decide = () => {};
    this.store = new BattleStore();
    this.store.myId = 'p1';
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
        Report.win(message[0], this.store);
        console.log(JSON.stringify(Report.data()));
      }
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
