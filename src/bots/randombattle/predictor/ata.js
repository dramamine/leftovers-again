/**
 * Stabby always picks the move with the most damage. He doesn't know how to
 * switch out, though.
 *
 */

import AI from '../../../ai';
import Damage from '../../../lib/damage';

import {MOVE, SWITCH} from '../../../decisions';

import {MongoClient} from 'mongodb';
import log from '../../../log';

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
    log.log('ATA constructed.');
    super(meta);

    if (!this.db) {
      MongoClient.connect(mongourl, (err, db) => {
        if (err) return console.error(err);
        console.log('db loaded.');
        this.db = db;
      });
    }
  }

  _compareKills(speciesA, speciesB) {
    // console.log('comparing kills btwn:', speciesA, speciesB);
    const inAlphabetical = [speciesA, speciesB].sort();
    const key = inAlphabetical.join('::');
    // console.log('using key', key);
    const promise = new Promise( (resolve, reject) => {
      // @TODO trim this line a bit
      this.db.collection('matchupresults').findOne({'_id': key},  (err, result) => {
        if (err) {
          log.error(err);
          reject(err);
        } else {
          // console.log('db result:');
          // console.log(result);
          let numeric = this._matchupResultsToValue(result.value);
          // got flipped before we looked up the key
          if (speciesA === inAlphabetical[1]) {
            numeric = 1 - numeric;
          }
          // console.log('resolving as ', numeric);
          resolve({
            species: speciesA,
            advantage: numeric
          });
        }
      });
    });
    return promise;
  }

  _matchupResultsToValue(result) {
    if (!result.akilled) return 0.5;
    // const diff = result.akilled - result.bkilled;
    const total = result.akilled + result.bkilled;
    if (total === 0) {
      return 0.5;
    }
    const rating = (result.akilled / total);
    // console.log(result);
    // console.log('-> ' + rating);
    return rating;
  }

  onRequest(state) {
    return new Promise( (resolve, reject) => {
      // don't try anything without our db connection!
      if (this.mongo) {
        console.log('coming back later...');
        setTimeout(onRequest, 1000, state);
        console.log('actually this will probs error out oh no!!');
        console.error('got a bot request before DB was ready');
        return reject(null);
      }

      // @TODO reserve is more like 'team', consider renaming
      // const advantages = [];
      const promises = [];
      let prom;
      state.self.reserve.forEach( (mon) => {
        prom = this._compareKills(mon.species, state.opponent.active.species);
        promises.push(prom);
        // advantages.push({
        //   species: mon.species,
        //   advantage: prom
        // });
      });

      Promise.all(promises).then( (advantages) => {
        console.log('all my promises resolved!!');
        console.log('my advantage array:');
        console.log(advantages);

        const myactive = advantages.find( (val) => {
          console.log('is he even trying', val.species, state.self.active.species);
          return state.self.active.species === val.species;
        });
        console.log('active: ' + myactive.advantage);
        const bestMons = advantages.sort( (a, b) => {
          return b.advantage - a.advantage;
        });
        const bestMon = bestMons[0];
        console.log('got bestMon', bestMon);


        if (state.forceSwitch || bestMon.advantage > myactive.advantage + 0.20 ) {
          console.log('switching into first one:', bestMon);
          resolve(new SWITCH(bestMon.species));
        }

        console.log('not switching');
        resolve(new MOVE(0));

        // did I just run this?
        // check bigrams


        // just run a popular move
        // const popularMoves = _getMoveCount(state.self.active.species);
        // console.log(popularMoves);
        // console.log('just running the first one', popularMoves[0]);
        // resolve(new MOVE(popularMoves[0]));

        // get move strength
        // GREEN: strong enough!
        // YELLOW: consider switching into a slightly better pokemon
        // RED: def. switch to a better pokemon
      });
    });
  }
}

export default ATA;
