import Pokemon from './pokemon';
import util from '../util';
// import log from '../log';


export default class BattleStore {
  constructor() {
    this.allmon = [];
    this.forceSwitch = false;
    this.teamPreview = false;

    this.myId = null;
    this.myNick = null;
    this.opponentId = null;
    this.opponentNick = null;

    // NOT sent to user. temporary storage.
    this.names = [];
  }

  handleSwitch(ident) {
    this._recordIdent(ident);
  }

  handleDamage(victim, condition, explanation) {
    const mon = this._recordIdent(victim);
    // only record this for opponent's pokemon for now
    if (mon.owner !== this.myId) {
      mon.useCondition(condition);
      console.log(mon.data());
    }
  }

  handleFaint(ident) {
    const mon = this._recordIdent(ident);
    mon.useCondition('0 fnt');
  }

  recordName(name) {
    console.log('recordName:', name, this.myNick, this.opponentNick);
    if (this.opponentNick) return;
    if (this.myNick && this.myNick !== name) {
      this.opponentNick = name;
      console.log('recorded opponent name as ', name);
    }
    this.names.push(name);
  }

  checkNames() {
    this.names.forEach( name => this.recordName(name) );
  }


  // what does the request look like? WELL. Check out these properties:
  // 'rqid': the request ID. ex. '1' for the first turn, '2' for the second, etc.
  //         These don't match up perfectly with turns bc you may have to swap
  //         out pokemon if one dies, etc.
  //  'side':
  //    'name': your name
  //    'id': either 'p1' or 'p2'
  //    'pokemon': [Pokemon]      (6 of them. they're the pokemon on yr side)
  //  'active':
  //    'moves': [Move]           (the 4 moves of your active pokemon)
  //
  //   Move is an object with these properties:
  //   'move': the move name (ex.'Fake Out')
  //   'id': the move ID (ex. 'fakeout')
  //   'pp': how many PP you currently have
  //   'maxpp': the max PP for this move
  //   'target': target in options (ex. 'normal')
  //   'disabled': boolean for whether this move can be used.
  //
  //   Pokemon look like this:
  //   'ident': ex. 'p1: Wormadam'
  //   'details': ex. 'Wormadam, L83, F'
  //   'condition': ex. '255/255'
  //   'hp': current HP
  //   'maxhp': maximum HP
  //   'active': boolean, true if pokemon is currently active
  //   'stats':
  //     'atk': attack
  //     'def': defense
  //     'spa': special attack
  //     'spd': special defense
  //     'spe': speed
  //   'moves': Array of move IDs
  //   'baseAbility': the ability of the Pokemon (ex. 'overcoat')
  //   'item' the Pokemon's held item (ex. 'leftovers')
  //   'pokeball': what kind of pokeball the Pokemon was caught with
  //   'canMegaEvo': Boolean for whether this Pokemon can mega-evolve
  //
  //
  // data = {};
  interpretRequest(data) {
    // console.log('request:', data);
    if (!this.myId) {
      this.myId = data.side.id;
      this.myNick = data.side.name;
      // console.log('my nick is ' + this.myNick + '. checking names...', this.names);
      this.checkNames();
    }

    if (data.wait) return;

    // this.state.self.active = [];
    // this.state.opponent.active = [];

    if (data.side && data.side.pokemon) {
      for (let i = 0; i < data.side.pokemon.length; i++) {
        const mon = data.side.pokemon[i];
        // if(mon.dead) {
        //   return handleDeath(mon.ident);
        // }
        const ref = this._recordIdent(mon.ident);
        // force this to update, since it's always true or unset.
        ref.active = mon.active || false;
        ref.assimilate(mon);

        // keep our own in the right order
        if (ref.owner === this.myId) {
          ref.order = i;
        }
      }
    }

    this.forceSwitch = data.forceSwitch || false;
    this.teamPreview = data.teamPreview || false;

    if (data.rqid) {
      this.rqid = data.rqid;
    }

    // process this later.
    if (data.active) {
      this.activeData = data.active;
    }
  }

  data() {
    const output = {
      self: {},
      opponent: {}
    };
    // const output = _.clone(this.state, true);
    const dataGetter = (mon) => { return mon.data(); };
    const iamowner = (mon) => { return mon.owner === this.myId; };
    const youareowner = (mon) => { return mon.owner !== this.myId; };
    const isactive = (mon) => { return !!mon.position || mon.active; };
    const byPosition = (a, b) => b.position - a.position;
    const byOrder = (a, b) => a.order - b.order;


    // use getState so we can filter out any crap.
    output.self.active = this.allmon
      .filter(iamowner)
      .filter(isactive)
      .map(dataGetter)
      .sort(byPosition);
    output.opponent.active = this.allmon
      .filter(youareowner)
      .filter(isactive)
      .map(dataGetter)
      .sort(byPosition);
    output.self.reserve = this.allmon
      .filter(iamowner)
      .sort(byOrder)
      .map(dataGetter);
    output.opponent.reserve = this.allmon
      .filter(youareowner)
      .sort(byOrder)
      .map(dataGetter);

    if (output.self.active.length > 1) {
      console.log('stop the presses! too many active pokemon');
      console.dir(this.allmon
        .filter(iamowner)
        .filter(isactive));
    }

    if (this.activeData) {
      for (let i = 0; i < this.activeData.length; i++) {
        const movesArr = this.activeData[i].moves;
        const updated = movesArr.map( (move) => { // eslint-disable-line
          return Object.assign(move, util.researchMoveById(move.id));
        });
        try {
          output.self.active[i].moves = updated;
        } catch (e) {
          console.log(e);
          console.log(output.self.active);
          console.log(this.activeData);
        }

        // for (let j = 0; j < movesArr.length; j++) {
        //   if (output.self.active[i].moves[j].id !== movesArr[j].id) {
        //     console.warn('WARNING: move arrays didnt match up!',
        //       output.self.active[i].moves[j].id, movesArr[j].id);
        //     console.warn('rq moves:', output.self.active[i].moves);
        //     console.warn('active moves:', movesArr);
        //     // bail and use active moves only;
        //     output.self.active[i].moves = movesArr;
        //     break;
        //   }
        //   Object.assign(output.self.active[i].moves[j], movesArr[j]);
        // }
      }
    }

    // compress arrays to singles
    if (output.self.active.length === 1) {
      output.self.active = output.self.active[0];
    }
    if (output.opponent.active.length === 1) {
      output.opponent.active = output.opponent.active[0];
    }

    if (this.forceSwitch) output.forceSwitch = true;
    if (this.teamPreview) output.teamPreview = true;


    output.rqid = this.rqid;

    return output;
  }

  // NEW FUNCTION. this is the one I like.
  _recordIdent(ident) {
    const owner = ident.substr(0, 2);
    const posStr = ident.substr(0, ident.indexOf(':'));
    const position = (posStr.length === 3) ? posStr : null;
    const species = ident.substr(ident.indexOf(' ') + 1);
    // console.log(ident, owner, position, species);

    const hello = this.allmon.find( (mon) => {
      return owner === mon.owner && species === mon.species;
    });

    if (hello) {
      if (position) {
        // update the guy who got replaced
        const goodbye = this.allmon.find( (mon) => {
          return position === mon.position;
        });
        if (goodbye) {
          goodbye.position = null;
        }
        // update our new guy
        hello.position = position;
      }
      // this shouldn't happen because this would mean we forgot to deactivate
      // a pokemon
      // if (hello.position !== position) {
      //   console.error('check out this weird shit. ', hello.position, position);
      // }

      return hello;
    }

    const dude = new Pokemon(species);
    dude.owner = owner;
    // for active pokemon only.
    // this only happens for opponent's pokemon, since our own pokemon are
    // always created on the first request, before any of them are active.
    if (position) dude.position = position;

    this.allmon.push(dude);

    return dude;
  }

  _findById(id) {
    return this.allmon.find( (mon) => { return mon.id === id; });
  }

  _identToId(ident) {
    return ident.replace('a: ', ': ');
  }

}

