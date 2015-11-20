/**
 * Stabby always picks the move with the most damage. He doesn't know how to
 * switch out, though.
 *
 */

import AI from '../../ai';
import Damage from '../../lib/damage';

import {MOVE, SWITCH} from '../../decisions';

import {MongoClient} from 'mongodb';
const mongourl = 'mongodb://localhost:27017/test';

const meta = {
  battletype: 'randombattle',
  author: 'marten',
  name: 'AskTheAudience',
  description: `
This is my first attempt at writing a bot using data analysis of
300k randombattle replays. Its general strategy is:
- assess how the active pokemon generally fares against its active opponent
- use that to decide whether to switch
  * switch to a pokemon that fares well against it
- randomly pick from popular first moves
- use bigrams to pick follow-up moves

* reach goal / more intelligent bot:
- run moves that are 2HKO or better
- boosts / status effects

- see if any of my other pokemon are a good deal stronger (20-30%)
- consider switching in
  `
};

class ATA extends AI {
  constructor() {
    super(meta);

    this.db = null;
    MongoClient.connect(mongourl, (err, db) => {
      if (err) return console.error(err);
      console.log('db loaded.');
      this.db = db;
    });
  }

  _compareKills(speciesA, speciesB) {
    console.log('comparing kills btwn:', speciesA, speciesB);
    const key = speciesA + '::' + speciesB;
    // @TODO trim this line a bit
    this.db.matchupresults.find({'key': key});
  }

  onRequest(state) {
    // don't try anything without our db connection!
    if (this.mongo) {
      console.log('coming back later...');
      setTimeout(onRequest, 1000, state);
      console.log('actually this will probs error out oh no!!');
      console.error('got a bot request before DB was ready');
      return null;
    }

    // @TODO reserve is more like 'team', consider renaming
    const advantages = [];
    state.self.reserve.forEach( (mon) => {
      advantages.push({
        species: mon.species,
        advantage: _compareKills(state.self.active.species, mon.species)
      });
    });
    console.log('my advantage array:');
    console.log(advantages);
    const myAdvantage = advantages[state.self.active.species];
    // these are objects of form { species: a, advantage: # }
    console.log(myAdvantage);
    bestMon = advantages.sort( (a, b) => {
      return a.advantage - b.advantage;
    })[0];
    console.log('got bestMon', bestMon);


    if (state.forceSwitch || bestMon.advantage > myAdvantage + 0.20 ) {
      console.log('switching into first one:', bestMon);
      return new SWITCH(bestMon);
    }

    // did I just run this?
    // check bigrams

    // just run a popular move
    const popularMoves = _getMoveCount(state.self.active.species);
    console.log(popularMoves);
    console.log('just running the first one', popularMoves[0]);
    return new MOVE(popularMoves[0]);

    // get move strength
    // GREEN: strong enough!
    // YELLOW: consider switching into a slightly better pokemon
    // RED: def. switch to a better pokemon
  }
}

export default ATA;
