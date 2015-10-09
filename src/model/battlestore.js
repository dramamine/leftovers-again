import Pokemon from './pokemon';
// import log from '../log';


export default class BattleStore {
  constructor() {
    this.allmon = [];
    this.forceSwitch = false;
    this.teamPreview = false;
  }

  handleSwitch(ident) {
    this._recordIdent(ident);
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
    console.log('request:', data);
    if (!this.myid) {
      this.myid = data.side.id;
      this.mynick = data.side.nick;
    }
    if (data.wait) return;

    // this.state.self.active = [];
    // this.state.opponent.active = [];

    if (data.side && data.side.pokemon) {
      data.side.pokemon.map( (mon) => {
        // if(mon.dead) {
        //   return handleDeath(mon.ident);
        // }
        const ref = this._recordIdent(mon.ident);
        ref.assimilate(mon);
      });
    }

    if (data.forceSwitch) {
      console.log('ok, request had a force switch in there.');
      this.forceSwitch = true;
    }
    if (data.teamPreview) {
      this.teamPreview = true;
    }

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
    const iamowner = (mon) => { return mon.owner === this.myid; };
    const youareowner = (mon) => { return mon.owner !== this.myid; };
    const isactive = (mon) => { return !!mon.position || mon.active; };
    const byPosition = (a, b) => b.position - a.position;

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
      .map(dataGetter);
    output.opponent.reserve = this.allmon
      .filter(youareowner)
      .map(dataGetter);

    if (this.activeData) {
      for (let i = 0; i < this.activeData.length; i++) {
        const movesArr = this.activeData[i].moves;
        for (let j = 0; j < movesArr.length; j++) {
          console.assert(output.self.active[i].moves[j].id === movesArr[j].id);
          //   console.error('WARNING: move arrays didnt match up!');
          //   continue;
          // }
          Object.assign(output.self.active[i].moves[j], movesArr[j]);
        }
      }
    }

    // compress arrays to singles
    if (output.self.active.length === 1) {
      output.self.active = output.self.active[0];
    }
    if (output.opponent.active.length === 1) {
      output.opponent.active = output.opponent.active[0];
    }

    // @TODO ew, I don't like this because it's destructive inside a get fn
    if (this.forceSwitch) {
      // console.log('including forceSwitch...');
      output.forceSwitch = true;
      this.forceSwitch = false;
    }

    if (this.teamPreview) {
      output.teamPreview = true;
      this.teamPreview = false;
    }

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

