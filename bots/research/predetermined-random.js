/**
 * Summon Talonflames to cast 'Roost' over and over.
 *
 * npm run develop -- --bot=anythinggoes/tester/rooster.js
 */


import AI from 'ai';
import Randumb from 'randumb';
import {MOVE, SWITCH} from 'decisions';
const meta = {
  battletype: 'anythinggoes'
};

export default class Predetermined extends AI {
  constructor() {
    super();
    this.meta = {
      accepts: 'anythinggoes',
      format: 'anythinggoes',
      team: this.getTeam()
    };

    this.ctr = -1;
  }

  getTeam() {
    return [{"name":"Chandelure","moves":["fireblast","trick","shadowball","energyball"],"ability":"Infiltrator","evs":{"hp":85,"atk":85,"def":85,"spa":85,"spd":85,"spe":85},"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"item":"Choice Specs","level":77,"shiny":false},{"name":"Accelgor","moves":["encore","spikes","yawn","bugbuzz"],"ability":"Hydration","evs":{"hp":81,"atk":85,"def":85,"spa":89,"spd":85,"spe":85},"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"item":"Leftovers","level":79,"shiny":false},{"name":"Mismagius","moves":["painsplit","willowisp","shadowball","destinybond"],"ability":"Levitate","evs":{"hp":85,"atk":85,"def":85,"spa":85,"spd":85,"spe":85},"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"item":"Leftovers","level":81,"shiny":false},{"name":"Rapidash","moves":["willowisp","sunnyday","solarbeam","flareblitz"],"ability":"Flash Fire","evs":{"hp":81,"atk":85,"def":85,"spa":89,"spd":85,"spe":85},"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"item":"Heat Rock","level":83,"shiny":false},{"name":"Wobbuffet","moves":["counter","destinybond","mirrorcoat","encore"],"ability":"Shadow Tag","evs":{"hp":85,"atk":85,"def":85,"spa":85,"spd":85,"spe":85},"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"item":"Custap Berry","level":79,"shiny":false},{"name":"Rhyperior","moves":["rockpolish","aquatail","earthquake","rockblast"],"ability":"Solid Rock","evs":{"hp":85,"atk":85,"def":85,"spa":85,"spd":85,"spe":85},"ivs":{"hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31},"item":"Weakness Policy","level":79,"shiny":false}];
  }

  onRequest(state) {
    console.log(state);
    if (state.forceSwitch || state.teamPreview) {
      console.log('being forced to switch');
      // our pokemon died :(
      // choose a random one
      const possibleMons = state.self.reserve.filter( (mon) => {
        if (mon.condition === '0 fnt') return false;
        if (mon.active) return false;
        return true;
      });
      const myMon = this.pickOne(possibleMons);
      return new SWITCH(myMon);
    }
    // pick a random move
    try {
      const possibleMoves = state.self.active.moves.filter( move => !move.disabled );
      const myMove = this.pickOne(possibleMoves);
      return new MOVE(myMove);
    } catch(e) {
      console.log('broke when checking possible moves:', e);
      console.dir(state);
      return null;
    }
  }

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

export default Predetermined;
