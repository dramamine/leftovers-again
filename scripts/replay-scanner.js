import fs from 'fs';
import Battle from '../src/battle';

const replay = process.argv[2];

class ReplayScanner {
  constructor() {
    this.battle = new Battle(null, {send: () => {}}, './ai');
    Battle.decide = () => {};
  }
  processFile(data) {
    data.split('\n').forEach( line => {
      const splits = line.split('|');
      if (splits.length <= 2) return;
      const type = splits[1];
      const message = splits.slice(2);

      this.battle.handle(type, message);
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
